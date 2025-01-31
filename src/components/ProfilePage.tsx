import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserCircle, Camera, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AvatarUploadProps {
    previewAvatar: string | null;
    uploading: boolean;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}

interface TextFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
}

interface FormActionsProps {
    isSubmitting: boolean;
    onCancel: () => void;
}

const getFileNameFromUrl = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.split('/').pop() || null;
    } catch {
        return null;
    }
};

const AvatarUpload = ({ previewAvatar, uploading, onUpload, onRemove }: AvatarUploadProps) => (
    <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Perfil</label>
        <div className="flex items-center space-x-6">
            <div className="relative group">
                {previewAvatar ? (
                    <img
                        src={previewAvatar}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserCircle className="w-12 h-12 text-gray-400" />
                    </div>
                )}
                <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <Camera className="w-6 h-6 text-white" />
                </label>
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={onUpload}
                    className="hidden"
                    disabled={uploading}
                />
            </div>
            <div>
                <p className="text-sm text-gray-500">Tamanho recomendado: 200x200 pixels</p>
                {uploading && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Enviando...
                    </p>
                )}
                {previewAvatar && !uploading && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center mt-2"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Remover Foto
                    </button>
                )}
            </div>
        </div>
    </div>
);

const TextField = ({ label, name, value, onChange, required = true, disabled }: TextFieldProps) => (
    <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            required={required}
            disabled={disabled}
        />
    </div>
);

const FormActions = ({ isSubmitting, onCancel }: FormActionsProps) => (
    <div className="flex justify-end space-x-4">
        <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
            <X className="w-4 h-4 mr-2" />
            Cancelar
        </button>
        <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
            {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
                <Check className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
        </button>
    </div>
);

export default function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        full_name: '',
        username: '',
        avatar_url: ''
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarToRemove, setAvatarToRemove] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Usuário não autenticado');

                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, username, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
                setPreviewAvatar(data.avatar_url);
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                toast.error('Erro ao carregar perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const previewUrl = URL.createObjectURL(file);
        setPreviewAvatar(previewUrl);
        setAvatarFile(file);
        setAvatarToRemove(false);
    };

    const handleRemovePhoto = () => {
        setPreviewAvatar(null);
        setAvatarToRemove(true);
        setAvatarFile(null);
        if (previewAvatar) {
            URL.revokeObjectURL(previewAvatar);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            let avatarUrl = profile.avatar_url;

            // Handle avatar removal
            if (avatarToRemove) {
                if (profile.avatar_url) {
                    const fileName = getFileNameFromUrl(profile.avatar_url);
                    if (fileName) {
                        await supabase.storage.from('avatars').remove([fileName]);
                    }
                }
                avatarUrl = '';
            }

            // Handle new avatar upload
            if (avatarFile) {
                // Delete old avatar if exists
                if (profile.avatar_url) {
                    const oldFileName = getFileNameFromUrl(profile.avatar_url);
                    if (oldFileName) {
                        await supabase.storage.from('avatars').remove([oldFileName]);
                    }
                }

                // Upload new avatar
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                setUploading(true);
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
                setUploading(false);
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    username: profile.username,
                    avatar_url: avatarUrl
                })
                .eq('id', user.id);

            if (error) {
                if (error.code === '23505') {
                    toast.error('Nome de usuário já está em uso');
                } else {
                    throw error;
                }
                return;
            }

            // Update local state
            setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
            setPreviewAvatar(avatarUrl);
            setAvatarFile(null);
            setAvatarToRemove(false);

            toast.success('Perfil atualizado com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            toast.error('Erro ao salvar alterações');
        } finally {
            setIsSubmitting(false);
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Perfil</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                    <AvatarUpload
                        previewAvatar={previewAvatar}
                        uploading={uploading}
                        onUpload={handleAvatarUpload}
                        onRemove={handleRemovePhoto}
                    />

                    <TextField
                        label="Nome Completo"
                        name="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        disabled={isSubmitting || uploading}
                    />

                    <TextField
                        label="Nome de Usuário"
                        name="username"
                        value={profile.username}
                        onChange={(e) => setProfile({...profile, username: e.target.value})}
                        disabled={isSubmitting || uploading}
                    />

                    <FormActions
                        isSubmitting={isSubmitting}
                        onCancel={() => navigate(-1)}
                    />
                </form>
            </div>
        </div>
    );
}