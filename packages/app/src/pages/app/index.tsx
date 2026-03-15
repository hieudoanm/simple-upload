import { ErrorModal } from '@simple-upload/components/ErrorModal';
import { FileList } from '@simple-upload/components/FileList';
import { Footer } from '@simple-upload/components/Footer';
import { Navbar } from '@simple-upload/components/Navbar';
import { SuccessModal } from '@simple-upload/components/SuccessModal';
import { UploadDropzone } from '@simple-upload/components/UploadDropzone';
import { uploadPost, useSimpleUpload } from '@simple-upload/react';
import { trpc } from '@simple-upload/utils/trpc';
import { NextPage } from 'next';
import { useRef, useState } from 'react';

const AppPage: NextPage = () => {
	const { uploading, progress } = useSimpleUpload();
	const presignPost = trpc.presignPost.useMutation();

	const inputRef = useRef<HTMLInputElement | null>(null);

	const [dragging, setDragging] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<{
		count: number;
		filenames: string[];
	} | null>(null);

	const handleFiles = async (fileList: FileList | null) => {
		if (!fileList) return;

		const selected = Array.from(fileList);
		setFiles(selected);

		try {
			for (const file of selected) {
				const { url, fields } = await presignPost.mutateAsync({
					filename: file.name,
					type: file.type,
					size: file.size,
				});

				await uploadPost(file, { url, fields });
			}

			setSuccess({
				count: selected.length,
				filenames: selected.map((f) => f.name),
			});

			setFiles([]);
			if (inputRef.current) inputRef.current.value = '';
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed');
		}
	};

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />

			<main className="flex flex-1 items-center justify-center px-4">
				<div className="w-full max-w-xl">
					<UploadDropzone
						inputRef={inputRef}
						uploading={uploading}
						progress={progress}
						success={!!success}
						dragging={dragging}
						setDragging={setDragging}
						onFiles={handleFiles}
					/>

					<FileList files={files} />
				</div>
			</main>

			<Footer />

			<ErrorModal error={error} onClose={() => setError(null)} />
			<SuccessModal success={success} onClose={() => setSuccess(null)} />
		</div>
	);
};

export default AppPage;
