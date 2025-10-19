import { Mail } from 'lucide-react'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';


export default function UserAuthForm() {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        fetch('/api/auth/request-magic-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.href = '/auth/verify?email=' + encodeURIComponent(email as string);
            // Optionally, show a success message to the user
        })
        .catch((error) => {
            console.error('Error:', error);
            // Optionally, show an error message to the user
        });
    };

    return (
        <>
            <form
                className="space-y-3"
                onSubmit={handleSubmit}
            >
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        name="email" 
                        type="email"
                        placeholder="Email"
                        className="h-10"
                        required
                    />
                </div>
                {/* Magic Link Button */}
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90">
                    <Mail className="w-6 h-6" />
                    Send Magic Link
                </Button>
            </form>

        </>
    );
}


