export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-700 border-t-purple-500`}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}
