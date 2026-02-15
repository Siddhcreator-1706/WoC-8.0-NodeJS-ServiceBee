import { useState, useRef } from 'react';

const ImageUpload = ({
    onImagesChange,
    maxImages = 3,
    existingImages = [],
    label = 'Upload Images',
    accept = 'image/jpeg,image/png,image/webp'
}) => {
    const [previews, setPreviews] = useState(existingImages);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setError('');

        if (previews.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Validate file sizes (5MB max)
        const oversized = files.find(f => f.size > 5 * 1024 * 1024);
        if (oversized) {
            setError('Each image must be under 5MB');
            return;
        }

        // Create previews
        const newPreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        const allPreviews = [...previews, ...newPreviews];
        setPreviews(allPreviews);
        onImagesChange(allPreviews.map(p => p.file).filter(Boolean));
    };

    const removeImage = (index) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
        onImagesChange(newPreviews.map(p => p.file).filter(Boolean));
    };

    return (
        <div className="space-y-3">
            <label className="block text-gray-300 text-sm">{label}</label>

            {error && (
                <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex flex-wrap gap-3">
                {previews.map((img, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={img.preview || img.url || img}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-purple-500/30"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                ))}

                {previews.length < maxImages && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="w-20 h-20 border-2 border-dashed border-purple-500/30 rounded-lg flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors"
                    >
                        <span className="text-2xl">+</span>
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple
                onChange={handleFileChange}
                className="hidden"
            />

            <p className="text-xs text-gray-500">
                {previews.length}/{maxImages} images • Max 5MB each • JPG, PNG, WebP
            </p>
        </div>
    );
};

export default ImageUpload;
