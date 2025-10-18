import { Mail } from 'lucide-react'
import { Input } from './ui/input';
import { Button } from './ui/button';


export default function UserAuthForm() {

    return (
        <>
            <form
                className="space-y-3"
            >
                <div className="space-y-2">
                    {/* <Label htmlFor="email">Email address</Label> */}
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


