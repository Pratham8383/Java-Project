@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Cormorant Garamond", serif;
}

@custom-variant dark (&:where(.dark, .dark *));


@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

body {
  @apply bg-[#F5F5F0] text-[#1A1A1A] transition-colors duration-300;
}

.dark body {
  @apply bg-[#1A1A1A] text-[#F5F5F0];
}

/* Custom scrollbar for that refined feel */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #5A5A4020;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5A5A4040;
}
