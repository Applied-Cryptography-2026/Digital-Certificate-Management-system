import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-text-primary mb-4">404</h1>
        <p className="text-lg font-mono text-text-secondary mb-8">Page not found</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
