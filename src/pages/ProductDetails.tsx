import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, X } from 'lucide-react';
import Header from '../components/Header';

interface ProductForm {
    title: string;
    description: string;
    price: string;
    quantity: string;
    brand: string;
    category: string;
    condition: string;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    images: string[];
    sku: string;
}

export default function ProductDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedMarketplaces = location.state?.selectedMarketplaces || [];

    const [formData, setFormData] = useState<ProductForm>({
        title: '',
        description: '',
        price: '',
        quantity: '',
        brand: '',
        category: '',
        condition: 'new',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        images: [],
        sku: '',
    });

    // Handler genérico para os demais campos
    const handleChange = useCallback(
        (
            e:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLTextAreaElement>
                | React.ChangeEvent<HTMLSelectElement>
        ) => {
            const { name, value } = e.target;
            if (name.startsWith('dimensions.')) {
                const dimension = name.split('.')[1];
                setFormData(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, [dimension]: value }
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        },
        []
    );

    // Handler específico para o campo de preço
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Substitui qualquer ponto por vírgula
        value = value.replace(/\./g, ',');

        // Remove caracteres que não sejam dígitos ou vírgula
        value = value.replace(/[^0-9,]/g, '');

        // Se o valor tiver mais de um caractere e iniciar com '0' sem vírgula em seguida, remove o zero
        if (value.length > 1 && value.startsWith('0') && value[1] !== ',') {
            value = value.substring(1);
        }

        setFormData(prev => ({ ...prev, price: value }));
    };

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const readers = Array.from(files).map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then(newImages => {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages].slice(0, 4) // Limita a 4 imagens
            }));
        });
    }, []);

    const removeImage = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form data:', { marketplaces: selectedMarketplaces, product: formData });
        alert('Produto cadastrado com sucesso!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <Header />
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar para seleção de marketplaces
                    </button>

                    <SelectedMarketplaces selectedMarketplaces={selectedMarketplaces} />

                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Detalhes do Produto</h1>

                        <div className="space-y-6">
                            <BasicInfo formData={formData} handleChange={handleChange} />
                            <Description formData={formData} handleChange={handleChange} />
                            <PricingQuantity
                                formData={formData}
                                handlePriceChange={handlePriceChange}
                                handleChange={handleChange}
                            />
                            <BrandCategory formData={formData} handleChange={handleChange} />
                            <Condition formData={formData} handleChange={handleChange} />
                            <DimensionsWeight formData={formData} handleChange={handleChange} />

                            <ImageUpload
                                images={formData.images}
                                handleImageUpload={handleImageUpload}
                                removeImage={removeImage}
                            />
                        </div>

                        <SubmitButton />
                    </form>
                </div>
            </div>
        </div>
    );
}

// --- Componentes auxiliares ---

const SelectedMarketplaces = ({ selectedMarketplaces }: { selectedMarketplaces: any[] }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Marketplaces selecionados:</h2>
        <div className="flex flex-wrap gap-2">
            {selectedMarketplaces.map((marketplace) => (
                <span
                    key={marketplace.id}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                >
          {marketplace.name}
        </span>
            ))}
        </div>
    </div>
);

const BasicInfo = ({ formData, handleChange }: { formData: ProductForm; handleChange: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
            label="Título do Produto*"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ex: Smartphone Samsung Galaxy S21"
        />
        <InputField
            label="SKU/Código do Produto"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Ex: PROD-001"
        />
    </div>
);

const Description = ({ formData, handleChange }: { formData: ProductForm; handleChange: any }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição do Produto*
        </label>
        <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Descreva detalhadamente o seu produto..."
        />
    </div>
);

interface PricingQuantityProps {
    formData: ProductForm;
    handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChange: any;
}

const PricingQuantity = ({ formData, handlePriceChange, handleChange }: PricingQuantityProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço*</label>
            <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input
                    type="text"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handlePriceChange}
                    placeholder="0,00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>
        <InputField
            label="Quantidade em Estoque*"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            placeholder="Ex: 100"
        />
    </div>
);

const BrandCategory = ({ formData, handleChange }: { formData: ProductForm; handleChange: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
            label="Marca"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Ex: Samsung"
        />
        <SelectField
            label="Categoria*"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            options={[
                { value: '', label: 'Selecione uma categoria' },
                { value: 'electronics', label: 'Eletrônicos' },
                { value: 'clothing', label: 'Roupas' },
                { value: 'home', label: 'Casa e Decoração' },
                { value: 'books', label: 'Livros' },
                { value: 'toys', label: 'Brinquedos' },
                { value: 'sports', label: 'Esportes' },
                { value: 'beauty', label: 'Beleza' },
                { value: 'health', label: 'Saúde' },
                { value: 'automotive', label: 'Automotivo' },
                { value: 'other', label: 'Outros' },
            ]}
        />
    </div>
);

const Condition = ({ formData, handleChange }: { formData: ProductForm; handleChange: any }) => (
    <SelectField
        label="Condição do Produto*"
        name="condition"
        value={formData.condition}
        onChange={handleChange}
        required
        options={[
            { value: 'new', label: 'Novo' },
            { value: 'used', label: 'Usado' },
            { value: 'refurbished', label: 'Recondicionado' },
        ]}
    />
);

const DimensionsWeight = ({ formData, handleChange }: { formData: ProductForm; handleChange: any }) => (
    <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Dimensões e Peso</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DimensionInput
                label="Comprimento (cm)"
                name="dimensions.length"
                value={formData.dimensions.length}
                onChange={handleChange}
            />
            <DimensionInput
                label="Largura (cm)"
                name="dimensions.width"
                value={formData.dimensions.width}
                onChange={handleChange}
            />
            <DimensionInput
                label="Altura (cm)"
                name="dimensions.height"
                value={formData.dimensions.height}
                onChange={handleChange}
            />
            <InputField
                label="Peso (kg)"
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
            />
        </div>
    </div>
);

const ImageUpload = ({
                         images,
                         handleImageUpload,
                         removeImage
                     }: {
    images: string[];
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (index: number) => void;
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagens do Produto
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
                <div key={index} className="relative aspect-square group">
                    <img
                        src={img}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}

            {images.length < 4 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 hover:border-indigo-500 cursor-pointer transition-colors">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Adicionar foto</span>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </label>
            )}
        </div>
    </div>
);

const SubmitButton = () => (
    <div className="mt-8 flex justify-end">
        <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
        >
            Publicar Produto
        </button>
    </div>
);

// --- Componentes base e utilitários ---

/**
 * Funções utilitárias para inputs numéricos
 */
const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Enter'];
    if (allowedKeys.includes(e.key)) return;

    // Permite apenas um ponto (que não será usado, pois usamos vírgula) ou vírgula
    if ((e.key === ',' && e.currentTarget.value.includes(',')) || (!/[0-9,]/.test(e.key))) {
        e.preventDefault();
    }
};

const handleNumericPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');
    // Permite apenas dígitos e vírgula
    if (!/^[0-9,]*$/.test(pasteData)) {
        e.preventDefault();
    }
};

/**
 * Componente de Input genérico com suporte a validação para números.
 */
const InputField = ({ label, type = 'text', ...props }: any) => {
    const numericHandlers =
        type === 'number'
            ? {
                onKeyDown: handleNumericKeyDown,
                onPaste: handleNumericPaste
            }
            : {};
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...props}
                {...numericHandlers}
            />
        </div>
    );
};

/**
 * Componente para inputs de dimensões (números) com os mesmos filtros.
 */
const DimensionInput = ({ label, ...props }: any) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                type="number"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...props}
                onKeyDown={handleNumericKeyDown}
                onPaste={handleNumericPaste}
            />
        </div>
    );
};

const SelectField = ({ label, options, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...props}
        >
            {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);
