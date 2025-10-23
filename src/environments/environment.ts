export const environment = {
    // Base URL de la web de Arcana (para construir las URLs de éxito y cancelación)
    arcanaTestUrl: 'http://localhost:4200',
    arcanaProdUrl: 'https://arcanaoficial.com',

    // Rutas relativas para redirecciones después del pago
    successUrl: '/payment/success',
    cancelUrl: '/payment/cancel',

    // Credenciales de Supabase (REEMPLAZA con tus valores reales)
    supabase: {
        url: 'https://yretyfqwufpvqpgwbyhv.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZXR5ZnF3dWZwdnFwZ3dieWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjYzNzUsImV4cCI6MjA3MDcwMjM3NX0.Yfo1wSjrkHsOFPD0QncBI-oy3F4ivw82i1d4rA5hXdM',
    },

};