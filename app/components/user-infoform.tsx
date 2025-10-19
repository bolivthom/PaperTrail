import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';


export default function UserInfoForm() {

    return (
        <>
            <form
                method='post'
                className="space-y-3"
                action="/api/users/update"
            >
                <div className="space-y-2">
                    <Label htmlFor="text">First Name</Label>
                    <Input
                        id="firstName"
                        name="first_name"
                        type="text"
                        placeholder="First Name"
                        className="h-10"
                        required
                    />

                </div>

                <div className="space-y-2">
                    <Label htmlFor="text">Last Name</Label>
                    <Input
                        id="lastName"
                        name="last_name"
                        type="text"
                        placeholder="Last Name"
                        className="h-10"
                        required
                    />
                </div>
                {/* Magic Link Button */}
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90">
                    Continue
                </Button>
            </form>

        </>
    );
}


