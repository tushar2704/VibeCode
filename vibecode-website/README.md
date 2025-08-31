# VibeCode Website

A modern, lightweight documentation website built with Next.js 15, TypeScript, and shadcn/ui components.

## 🚀 Features

### Core Features
- ✅ **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- ✅ **Enhanced Theme System**: Light/Dark/System mode with smooth transitions
- ✅ **Responsive Design**: Mobile-first design with adaptive layouts
- ✅ **Static Site Generation**: Optimized for fast loading and SEO

### Navigation & Search
- ✅ **Smart Navigation**: Collapsible sidebar with active page highlighting
- ✅ **Global Search**: Full-text search with keyboard shortcuts (Ctrl+K)
- ✅ **Breadcrumb Navigation**: Clear page hierarchy and navigation
- ✅ **Page Navigation**: Previous/Next page functionality

### Content Management
- ✅ **Dynamic Content**: Markdown processing with MDX support
- ✅ **Syntax Highlighting**: Code blocks with copy-to-clipboard
- ✅ **Table of Contents**: Auto-generated TOC with scroll tracking
- ✅ **Reading Progress**: Visual progress indicator for long articles

### Accessibility & UX
- ✅ **Keyboard Navigation**: Full keyboard accessibility support
- ✅ **Screen Reader Support**: ARIA labels and semantic HTML
- ✅ **Print Optimization**: Print-friendly CSS styling
- ✅ **Error Handling**: Custom 404 page and error boundaries

### SEO & Performance
- ✅ **SEO Optimized**: Meta tags, sitemap.xml, robots.txt
- ✅ **Performance Optimized**: Static generation, image optimization
- ✅ **Analytics Ready**: Easy analytics integration support

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/tusharaggarwalinseec/VibeCode.git
cd VibeCode/vibecode-website

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
vibecode-website/
├── src/
│   ├── app/                 # Next.js 15 app directory
│   │   ├── docs/           # Dynamic documentation routes
│   │   ├── globals.css     # Global styles and theme variables
│   │   ├── layout.tsx      # Root layout component
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── book-layout.tsx # Main layout for documentation
│   │   ├── navigation.tsx  # Header navigation
│   │   ├── search.tsx     # Search functionality
│   │   └── ...            # Other components
│   └── lib/               # Utility functions
│       ├── content.ts     # Content management utilities
│       └── utils.ts       # General utilities
├── public/                # Static assets
├── docs/                  # Documentation markdown files
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Deployment

### Vercel (Recommended)
The site is configured for easy deployment on Vercel:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build**: Vercel will automatically detect Next.js configuration
3. **Deploy**: Push to main branch for automatic deployment

### Netlify
For Netlify deployment:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `out`
3. **Environment Variables**: Set any required environment variables

### Manual Static Export
Generate static files for any hosting provider:

```bash
npm run build
```

The static files will be generated in the `out` directory.

## ⚙️ Configuration

### Environment Variables
Create a `.env.local` file for local development:

```env
# Optional: Analytics configuration
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Site configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Customization

#### Themes
- Edit `src/app/globals.css` to modify theme colors
- Update theme configuration in `src/components/theme-provider.tsx`

#### Content
- Add markdown files to the `docs/` directory
- Update navigation structure in `src/components/book-sidebar.tsx`

#### Styling
- Modify component styles in individual component files
- Update global styles in `src/app/globals.css`
- Customize Tailwind configuration in `tailwind.config.ts`

## 🎨 Design System

### Theme Colors
The design system uses CSS custom properties for theming:
- **Primary Colors**: Brand and accent colors
- **Neutral Colors**: Backgrounds, borders, text
- **Semantic Colors**: Success, error, warning states

### Typography
- **Headings**: Responsive scale with proper hierarchy
- **Body Text**: Optimized for readability
- **Code Text**: Monospace font with syntax highlighting

### Components
All UI components follow the shadcn/ui design system:
- Consistent spacing and sizing
- Accessible by default
- Customizable with Tailwind classes

## 🔧 Advanced Features

### Keyboard Shortcuts
- `Ctrl/Cmd + K` - Open search
- `?` - Show keyboard shortcuts help
- `Tab` / `Shift + Tab` - Navigate focusable elements
- `Esc` - Close modals/dialogs

### Search Functionality
- Full-text search across all documentation
- Keyboard navigation in search results
- Debounced search with loading states
- Results categorization and tagging

### Accessibility Features
- **Keyboard Navigation**: Full site navigation via keyboard
- **Screen Reader Support**: Proper ARIA labels and landmarks
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG AA compliant color schemes
- **Print Support**: Optimized print stylesheet

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Tushar Aggarwal**
- LinkedIn: [tusharaggarwalinseec](https://www.linkedin.com/in/tusharaggarwalinseec/)
- GitHub: [tusharaggarwalinseec](https://github.com/tusharaggarwalinseec)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Icon library

---

Built with ❤️ using modern web technologies for optimal performance and developer experience.