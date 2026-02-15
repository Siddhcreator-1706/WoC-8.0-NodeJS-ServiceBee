const User = require('../models/User');
const Company = require('../models/Company');
const Service = require('../models/Service');
const { deleteImage } = require('../config/cloudinary');
const { sendAccountActionEmail } = require('../utils/emailService');

// @desc    Get all users
// ... (skiplines)

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin/Superuser
const getUsers = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const filter = includeInactive === 'true' ? {} : { isActive: true };
        const users = await User.find(filter)
            .select('-password')
            .populate('company', 'name logo isVerified description email phone website address serviceType');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin/Superuser
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id
// @access  Private/Superuser
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteUser = async (req, res) => {
    try {
        const { force, reason } = req.query;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        // Check if safe to delete
        const canDeleteCheck = await User.canDelete(req.params.id);

        if (!canDeleteCheck.canDelete) {
            // If force=true and admin, use soft delete (deactivate)
            if (force === 'true') {
                const days = parseInt(req.query.days) || 0;
                let expiresAt = null;
                let durationText = 'indefinitely';

                if (days > 0) {
                    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                    durationText = `for ${days} days`;
                }

                await User.softDelete(req.params.id, reason || 'Account deactivated by admin');

                // Send email notification: Banned/Suspended
                const emailReason = (reason || 'Account deactivated by administrator') +
                    (days > 0 ? ` (Suspended ${durationText})` : '');

                await sendAccountActionEmail(
                    user.email,
                    'banned',
                    emailReason,
                    user.name
                );

                return res.json({
                    message: `User account has been suspended ${durationText}. Active complaints preserved.`,
                    note: 'User data is retained for complaint history. Use permanent delete only after complaints are resolved.'
                });
            }

            // Not safe and no force - return error with options
            return res.status(400).json({
                message: canDeleteCheck.message,
                activeComplaints: canDeleteCheck.activeComplaintsCount,
                options: {
                    softDelete: 'Add ?force=true to deactivate the user instead of deleting',
                    waitForResolution: 'Resolve all pending complaints first, then delete'
                }
            });
        }

        // Safe to delete - no active complaints

        // Cascade Delete: If user is provider, remove their company and services
        if (user.role === 'provider') {
            const company = await Company.findOne({ owner: req.params.id });
            if (company) {
                // Delete services associated with company
                await Service.deleteMany({ company: company._id });

                // Delete company logo from Cloudinary
                if (company.logoPublicId) {
                    try {
                        await deleteImage(company.logoPublicId);
                    } catch (error) {
                        console.error('Failed to delete company logo:', error);
                    }
                }

                // Delete company
                await company.deleteOne();
            }
        }

        // Send email notification: Deleted
        await sendAccountActionEmail(
            user.email,
            'deleted',
            reason || 'Account deleted by administrator',
            user.name
        );

        await user.deleteOne();
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reactivate a deactivated user
// @route   PUT /api/users/:id/reactivate
// @access  Private/Superuser
const reactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isActive) {
            return res.status(400).json({ message: 'User is already active' });
        }

        user.isActive = true;
        user.deactivatedAt = undefined;
        user.deactivationReason = undefined;
        await user.save();

        // Send email notification: Reactivated
        await sendAccountActionEmail(
            user.email,
            'reactivated',
            'Your account has been reactivated. Welcome back!',
            user.name
        );

        res.json({ message: 'User reactivated successfully', user: { _id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.city = req.body.city || user.city;
            user.state = req.body.state || user.state;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                city: updatedUser.city,
                state: updatedUser.state,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
const updateUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (await user.matchPassword(req.body.currentPassword)) {
                user.password = req.body.newPassword;
                await user.save();
                res.json({ message: 'Password updated successfully' });
            } else {
                res.status(401).json({ message: 'Invalid current password' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    reactivateUser,
    updateUserProfile,
    updateUserPassword
};
