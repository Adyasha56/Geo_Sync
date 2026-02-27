export default function Toast({ message, type = 'info' }) {
  if (!message) return null;

  const bgColors = {
    info: 'var(--purple-50)',
    error: 'var(--red-50)',
    success: 'var(--green-50)',
  };

  const textColors = {
    info: 'var(--purple-900)',
    error: 'var(--red-900)',
    success: 'var(--green-900)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 20px',
        borderRadius: 8,
        background: bgColors[type] || bgColors.info,
        color: textColors[type] || textColors.info,
        fontSize: 14,
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 9999,
        maxWidth: '90%',
      }}
    >
      {message}
    </div>
  );
}
