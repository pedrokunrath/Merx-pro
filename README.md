# Merx - Multi-Marketplace Product Manager

Merx is a powerful web application designed to streamline the process of listing products across multiple e-commerce platforms. Instead of manually creating listings on each marketplace, Merx allows you to manage your product listings from a single, intuitive interface.

## Features

- **Multi-Marketplace Integration**: List products simultaneously on popular platforms:
  - Mercado Livre
  - Amazon
  - Shopee
  - Shein
  - Magazine Luiza
  - OLX
  
- **Unified Product Management**: Create a single product listing and publish it to multiple marketplaces
- **Comprehensive Product Details**: Detailed form for product information including:
  - Basic product information
  - Pricing and inventory
  - Product dimensions and weight
  - Multiple product images
  - Product condition
  - Categorization

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (version 16 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd merx
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development

- Built with React + TypeScript
- Styled with Tailwind CSS
- Icons from Lucide React
- Routing with React Router

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
merx/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository's issue tracker.