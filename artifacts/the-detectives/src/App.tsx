import { type ReactNode, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ClerkProvider,
  Show,
  SignIn,
  SignUp,
  useClerk,
} from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Interview from '@/pages/Interview';
import Admin from '@/pages/Admin';
import Dashboard from '@/pages/Dashboard';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in the environment.');
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#214f91',
    colorForeground: '#142947',
    colorMutedForeground: '#52677f',
    colorDanger: '#b42318',
    colorBackground: '#fbfdff',
    colorInput: '#f5f9fc',
    colorInputForeground: '#142947',
    colorNeutral: '#d4e2ec',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fbfdff] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#142947]',
    headerSubtitle: 'text-[#52677f]',
    socialButtonsBlockButtonText: 'text-[#142947]',
    formFieldLabel: 'text-[#142947]',
    footerActionLink: 'text-[#214f91]',
    footerActionText: 'text-[#52677f]',
    dividerText: 'text-[#52677f]',
    identityPreviewEditButton: 'text-[#214f91]',
    formFieldSuccessText: 'text-[#246a4b]',
    alertText: 'text-[#142947]',
    logoBox: 'h-11',
    logoImage: 'h-11 w-11',
    socialButtonsBlockButton: 'border-[#d4e2ec]',
    formButtonPrimary: 'bg-[#214f91] hover:bg-[#173c72]',
    formFieldInput: 'bg-[#f5f9fc] text-[#142947] border-[#d4e2ec]',
    footerAction: 'text-[#52677f]',
    dividerLine: 'bg-[#d4e2ec]',
    alert: 'border-[#d4e2ec]',
    otpCodeFieldInput: 'text-[#142947] border-[#d4e2ec]',
    formFieldRow: 'text-[#142947]',
    main: 'text-[#142947]',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUser = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const currentUser = user?.id ?? null;
      if (previousUser.current !== undefined && previousUser.current !== currentUser) {
        queryClient.clear();
      }
      previousUser.current = currentUser;
    });
    return unsubscribe;
  }, [addListener]);
  return null;
}

function SignInPage() {
  const next = new URLSearchParams(window.location.search).get('next');
  const safeNext =
    next?.startsWith('/interview') || next?.startsWith('/admin') ? next : basePath || '/';
  return (
    <div className="clerk-auth-page">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={safeNext}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="clerk-auth-page">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={basePath || '/'}
      />
    </div>
  );
}

function AuthRequired({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const next = `${location}${window.location.search}`;
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <div className="auth-required-page">
          <a className="back-home" href="/">
            THE DETECTIVES
          </a>
          <div className="auth-required-card">
            <p className="eyebrow">SECURE RESEARCH WORKSPACE</p>
            <h1>Sign in to continue.</h1>
            <p>Interview records are saved under your account and are not public.</p>
            <a
              href={`${basePath}/sign-in?next=${encodeURIComponent(next)}`}
              className="button button-primary"
            >
              Sign in <span aria-hidden="true">→</span>
            </a>
            <a href={`${basePath}/sign-up`} className="text-link">
              Create a verified account
            </a>
          </div>
        </div>
      </Show>
    </>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/interview">
          <AuthRequired>
            <Interview />
          </AuthRequired>
        </Route>
        <Route path="/admin">
          <AuthRequired>
            <Admin />
          </AuthRequired>
        </Route>
        <Route path="/admin/dashboard">
          <AuthRequired>
            <Dashboard />
          </AuthRequired>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: { title: 'Welcome back', subtitle: 'Sign in to continue your research.' },
        },
        signUp: {
          start: { title: 'Join the research team', subtitle: 'Create a verified account to continue.' },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
