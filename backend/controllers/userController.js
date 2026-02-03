const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin/Superuser
const getUsers = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const filter = includeInactive === 'true' ? {} : { isActive: true };
        const users = await User.find(filter).select('-password');
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

        if (!['user', 'admin', 'superuser'].includes(role)) {
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

// @desc    Delete user (smart delete)
// @route   DELETE /api/users/:id
// @access  Private/Superuser
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
            // If force=true and superuser, use soft delete (deactivate)
            if (force === 'true') {
                await User.softDelete(req.params.id, reason || 'Account deactivated by admin');
                return res.json({
                    message: 'User account has been deactivated (soft deleted). Active complaints preserved.',
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

        res.json({ message: 'User reactivated successfully', user: { _id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    reactivateUser
};
