import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';


export default function UserInfoForm() {

    return (
        <>
            <form
                className="space-y-3"
            >
                <div className="space-y-2">
                    <Label htmlFor="text">First Name</Label>
                    <Input
                        id="firstName"
                        name="firstName"
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
                        name="lastName"
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


