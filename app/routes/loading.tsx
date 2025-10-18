import LoadingView from "~/components/loading-view";

export default function LoadingPage() {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoadingView title={"Getting your dashboard ready…"} description="Just a moment,"/>
        </div>
    );
}
