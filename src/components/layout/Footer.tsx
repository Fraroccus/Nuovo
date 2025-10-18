export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Warehouse Manager. All rights
            reserved.
          </p>
          <div className="flex space-x-4">
            <a
              href="/about"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              About
            </a>
            <a
              href="/docs"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Documentation
            </a>
            <a
              href="/support"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
