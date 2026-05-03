import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/use-auth'

export function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register({ username, email, password })
      navigate('/', { replace: true })
    } catch (registerError) {
      setError(
        registerError instanceof Error ? registerError.message : 'Hesap oluşturulamadı.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold tracking-tight">Hesap oluştur</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Birkaç saniyede kaydol, siparişlerini ve adreslerini tek yerden yönet.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="username" className="text-sm font-medium">
                  Kullanıcı adı
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                  minLength={3}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">
                  E-posta
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">En az 6 karakter.</p>
              </div>

              {error ? (
                <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Hesap oluşturuluyor...' : 'Hesap oluştur'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="font-medium text-foreground hover:underline">
                Giriş yap
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
