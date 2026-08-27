export function PonyBadge() {
  return (
    <span className="app-brand-badge" aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 78 C17 66 17 52 27 41 C24 33 27 23 36 17 L41 24 C46 16 56 13 63 19 C67 15 73 16 75 21 C71 25 69 29 71 33 C79 35 86 41 89 49 C85 51 79 51 75 48 C77 56 75 65 69 71 L61 67 C56 73 47 77 39 77 C35 81 29 83 22 78 Z"
          fill="currentColor"
        />
        <circle cx="63" cy="30" r="2.4" fill="var(--color-bg)" />
      </svg>
    </span>
  );
}
