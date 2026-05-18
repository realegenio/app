// nav.js — Sidebar compartido para todas las páginas
// Uso: <script src="/nav.js"></script> + <kodigo-nav page="tickets"></kodigo-nav>
// Para agregar módulo: añadir un objeto al array MENU_ITEMS

(function () {
    'use strict';

    // ── CONFIGURACIÓN DEL MENÚ ──────────────────────────────────────
    // page: clave única que identifica la página activa
    // modulo: null = visible para todos, string = requiere ese permiso en permisos{}
    // role: null = cualquier rol, array = roles permitidos
    const MENU_ITEMS = [
        {
            titulo:  'Dashboard',
            icono:   'mdi-view-dashboard-outline',
            href:    '/dashboard.html',
            page:    'dashboard',
            modulo:  null,
            role:    null
        },
        {
            titulo:  'Tickets',
            icono:   'mdi-ticket-outline',
            href:    '/tickets.html',
            page:    'tickets',
            modulo:  null,
            role:    null
        },
        {
            titulo:  'RRHH',
            icono:   'mdi-account-group-outline',
            href:    '/rrhh.html',
            page:    'rrhh',
            modulo:  'rrhh',
            role:    null
        },
        {
            titulo:  'Cobranza',
            icono:   'mdi-cash-multiple',
            href:    '/cobranza.html',
            page:    'cobranza',
            modulo:  'cobranza',
            role:    null
        },
        {
            titulo:  'Empleabilidad',
            icono:   'mdi-briefcase-outline',
            href:    '/empleabilidad.html',
            page:    'empleabilidad',
            modulo:  'empleabilidad',
            role:    null
        },
        {
            titulo:  'Horas',
            icono:   'mdi-clock-outline',
            href:    '/horas.html',
            page:    'horas',
            modulo:  'horas',
            role:    null
        }
    ];

    // ── HELPER: logout centralizado ─────────────────────────────────
    async function doLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (_) {}
        localStorage.removeItem('usuario');
        window.location.href = '/index.html';
    }

    // ── COMPONENTE Vue 3 ────────────────────────────────────────────
    window.KodigoNav = {
        props: {
            page: { type: String, required: true }
        },

        setup(props) {
            const { ref, computed } = Vue;

            const abierto  = ref(true);   // sidebar expandido/colapsado
            const usuario  = JSON.parse(localStorage.getItem('usuario') || '{}');
            const permisos = usuario.permisos || {};
            const role     = usuario.role     || '';

            // Filtrar ítems según permisos del usuario
            const items = computed(() => {
                return MENU_ITEMS.filter(item => {
                    // Si requiere módulo, verificar que lo tenga
                    if (item.modulo && role !== 'owner' && !permisos[item.modulo]) return false;
                    // Si requiere rol específico
                    if (item.role && !item.role.includes(role)) return false;
                    return true;
                });
            });

            const iniciales = computed(() => {
                const n = usuario.nombre || '';
                return n.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';
            });

            const toggle = () => { abierto.value = !abierto.value; };
            const logout = () => doLogout();

            return { abierto, usuario, items, iniciales, toggle, logout, paginaActiva: props.page };
        },

        template: `
<div :class="['kodigo-sidebar', abierto ? 'sidebar-open' : 'sidebar-closed']">

    <!-- Cabecera / logo -->
    <div class="sidebar-header">
        <transition name="fade-slide">
            <div v-if="abierto" class="sidebar-brand">
                <img src="/pictures/logoKodigo.png" alt="Kodigo" class="sidebar-logo" />
                <div class="sidebar-brand-text">
                    <div class="brand-name">Kodigo</div>
                    <div class="brand-sub">Panel Interno</div>
                </div>
            </div>
        </transition>
        <button class="toggle-btn" @click="toggle" :title="abierto ? 'Colapsar' : 'Expandir'">
            <i :class="['mdi', abierto ? 'mdi-chevron-left' : 'mdi-menu']"></i>
        </button>
    </div>

    <!-- Ítems de navegación -->
    <nav class="sidebar-nav">
        <a
            v-for="item in items"
            :key="item.page"
            :href="item.href"
            :class="['nav-item', item.page === paginaActiva ? 'nav-item-active' : '']"
            :title="!abierto ? item.titulo : ''"
        >
            <i :class="['mdi', item.icono, 'nav-icon']"></i>
            <transition name="fade-slide">
                <span v-if="abierto" class="nav-label">{{ item.titulo }}</span>
            </transition>
            <span v-if="item.page === paginaActiva" class="nav-active-bar"></span>
        </a>
    </nav>

    <!-- Footer: usuario + logout -->
    <div class="sidebar-footer">
        <div class="user-row">
            <div class="user-avatar">{{ iniciales }}</div>
            <transition name="fade-slide">
                <div v-if="abierto" class="user-info">
                    <div class="user-nombre">{{ usuario.nombre || 'Usuario' }}</div>
                    <div class="user-role">{{ usuario.role || '' }}</div>
                </div>
            </transition>
        </div>
        <button class="logout-btn" @click="logout" title="Cerrar sesión">
            <i class="mdi mdi-logout"></i>
            <transition name="fade-slide">
                <span v-if="abierto">Salir</span>
            </transition>
        </button>
    </div>

</div>
        `
    };

    // ── ESTILOS (inyectados una sola vez) ───────────────────────────
    if (!document.getElementById('kodigo-nav-styles')) {
        const style = document.createElement('style');
        style.id = 'kodigo-nav-styles';
        style.textContent = `
            /* ── Variables ── */
            :root {
                --nav-bg:        #120C24;
                --nav-border:    rgba(247,143,33,0.35);
                --nav-accent:    #03AE8E;
                --nav-orange:    #F78F21;
                --nav-purple:    #472268;
                --nav-text:      rgba(255,255,255,0.75);
                --nav-text-dim:  rgba(255,255,255,0.35);
                --nav-hover:     rgba(3,174,142,0.10);
                --nav-active-bg: rgba(3,174,142,0.15);
                --nav-open-w:    220px;
                --nav-close-w:   60px;
                --nav-transition: 0.22s cubic-bezier(0.4,0,0.2,1);
            }

            /* ── Sidebar contenedor ── */
            .kodigo-sidebar {
                position: fixed;
                top: 0; left: 0; bottom: 0;
                z-index: 200;
                display: flex;
                flex-direction: column;
                background: var(--nav-bg);
                border-right: 1px solid var(--nav-border);
                transition: width var(--nav-transition);
                overflow: hidden;
                box-shadow: 4px 0 24px rgba(0,0,0,0.35);
            }
            .sidebar-open  { width: var(--nav-open-w); }
            .sidebar-closed { width: var(--nav-close-w); }

            /* ── Empujar el main content ── */
            /* Cada página necesita: <v-main style="margin-left: var(--nav-open-w)"> */
            /* O usar la clase .with-nav en el body */
            body.with-nav .v-main,
            body.with-nav main.v-main {
                padding-left: 0 !important;
            }

            /* ── Header ── */
            .sidebar-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 10px 12px;
                border-bottom: 1px solid rgba(247,143,33,0.2);
                min-height: 64px;
                flex-shrink: 0;
            }
            .sidebar-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                overflow: hidden;
            }
            .sidebar-logo {
                height: 32px;
                width: auto;
                flex-shrink: 0;
            }
            .sidebar-brand-text { overflow: hidden; }
            .brand-name {
                font-size: 0.95rem;
                font-weight: 700;
                color: #fff;
                white-space: nowrap;
            }
            .brand-sub {
                font-size: 0.65rem;
                color: var(--nav-text-dim);
                text-transform: uppercase;
                letter-spacing: 1.5px;
                white-space: nowrap;
            }
            .toggle-btn {
                flex-shrink: 0;
                width: 32px; height: 32px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.04);
                color: var(--nav-text);
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.1rem;
                transition: background 0.15s, color 0.15s;
            }
            .toggle-btn:hover { background: var(--nav-hover); color: var(--nav-accent); }

            /* ── Nav items ── */
            .sidebar-nav {
                flex: 1;
                padding: 10px 8px;
                display: flex;
                flex-direction: column;
                gap: 2px;
                overflow-y: auto;
                overflow-x: hidden;
            }
            .sidebar-nav::-webkit-scrollbar { width: 3px; }
            .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

            .nav-item {
                position: relative;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 12px;
                border-radius: 10px;
                text-decoration: none;
                color: var(--nav-text);
                font-size: 0.85rem;
                font-weight: 500;
                transition: background 0.15s, color 0.15s;
                white-space: nowrap;
                overflow: hidden;
            }
            .nav-item:hover {
                background: var(--nav-hover);
                color: #fff;
            }
            .nav-item-active {
                background: var(--nav-active-bg) !important;
                color: var(--nav-accent) !important;
                font-weight: 600;
            }
            .nav-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
                width: 20px;
                text-align: center;
            }
            .nav-label { flex: 1; }
            .nav-active-bar {
                position: absolute;
                right: 0; top: 20%; bottom: 20%;
                width: 3px;
                background: var(--nav-accent);
                border-radius: 3px 0 0 3px;
            }

            /* ── Footer ── */
            .sidebar-footer {
                padding: 12px 8px;
                border-top: 1px solid rgba(255,255,255,0.06);
                flex-shrink: 0;
            }
            .user-row {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px;
                border-radius: 10px;
                margin-bottom: 6px;
                overflow: hidden;
            }
            .user-avatar {
                flex-shrink: 0;
                width: 32px; height: 32px;
                border-radius: 8px;
                background: linear-gradient(135deg, var(--nav-purple), #2a1545);
                border: 1px solid var(--nav-orange);
                display: flex; align-items: center; justify-content: center;
                font-size: 0.7rem;
                font-weight: 700;
                color: #fff;
            }
            .user-info { overflow: hidden; }
            .user-nombre {
                font-size: 0.78rem;
                font-weight: 600;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 130px;
            }
            .user-role {
                font-size: 0.65rem;
                color: var(--nav-text-dim);
                text-transform: capitalize;
            }
            .logout-btn {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid rgba(237,74,36,0.25);
                background: rgba(237,74,36,0.06);
                color: rgba(237,74,36,0.8);
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s, color 0.15s;
                white-space: nowrap;
                overflow: hidden;
            }
            .logout-btn:hover {
                background: rgba(237,74,36,0.15);
                color: #ED4A24;
            }

            /* ── Transición fade-slide ── */
            .fade-slide-enter-active,
            .fade-slide-leave-active {
                transition: opacity 0.18s, transform 0.18s;
            }
            .fade-slide-enter-from,
            .fade-slide-leave-to {
                opacity: 0;
                transform: translateX(-6px);
            }

            /* ── App bar: ocultar en páginas con sidebar ── */
            body.with-nav .v-app-bar { display: none !important; }
        `;
        document.head.appendChild(style);
    }

})();