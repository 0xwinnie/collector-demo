import NftGallery from "../components/NftGallery";

// ...in your real app, gate this page behind your existing auth...
export default function NftsPage() {
    // TODO: replace with your logged-in user's owner address (wallet public key, etc.)
    const owner: string | undefined = undefined;

    return (
        <main style={{ padding: 24 }}>
            <NftGallery owner={owner} />
        </main>
    );
}
