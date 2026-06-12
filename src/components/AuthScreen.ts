import { gameStore } from '../store/gameStore';

/** Renders the auth screen HTML overlay with login/signup/guest modes */
export function renderAuthScreen(onComplete: () => void) {
  const overlay = document.getElementById('auth-overlay')!;

  overlay.innerHTML = `
    <div class="auth-card">
      <div class="auth-molecule">⚗️</div>
      <h1>CHEMICRAFT</h1>
      <p class="subtitle">Learn Chemistry Through Adventure</p>

      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login" id="tab-login">Login</button>
        <button class="auth-tab" data-tab="signup" id="tab-signup">Sign Up</button>
      </div>

      <!-- Login Form -->
      <form id="login-form">
        <div class="form-group">
          <label for="login-username">Username</label>
          <input type="text" id="login-username" placeholder="Enter your username" autocomplete="username" required />
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" placeholder="Enter your password" autocomplete="current-password" required />
        </div>
        <div class="error-msg" id="login-error"></div>
        <button type="submit" class="btn-primary">Enter the Lab →</button>
      </form>

      <!-- Signup Form (hidden by default) -->
      <form id="signup-form" style="display: none;">
        <div class="form-group">
          <label for="signup-username">Username</label>
          <input type="text" id="signup-username" placeholder="Choose a username" autocomplete="username" required minlength="3" />
        </div>
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input type="email" id="signup-email" placeholder="your@email.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label for="signup-password">Password</label>
          <input type="password" id="signup-password" placeholder="Choose a password" autocomplete="new-password" required minlength="6" />
        </div>
        <div class="error-msg" id="signup-error"></div>
        <button type="submit" class="btn-primary">Create Account →</button>
      </form>

      <div class="divider">or</div>

      <button class="btn-guest" id="btn-guest">
        ⚡ Play as Guest (progress won't be saved)
      </button>
    </div>
  `;

  // Tab switching
  const loginTab = overlay.querySelector('#tab-login')!;
  const signupTab = overlay.querySelector('#tab-signup')!;
  const loginForm = overlay.querySelector('#login-form') as HTMLFormElement;
  const signupForm = overlay.querySelector('#signup-form') as HTMLFormElement;

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
  });

  // Login submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = (overlay.querySelector('#login-username') as HTMLInputElement).value.trim();
    const password = (overlay.querySelector('#login-password') as HTMLInputElement).value;

    if (!username || !password) {
      showError('login-error', 'Please fill in all fields.');
      return;
    }

    // Local auth — just check username exists in localStorage
    gameStore.login(username);
    hideOverlay(overlay, onComplete);
  });

  // Signup submit
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = (overlay.querySelector('#signup-username') as HTMLInputElement).value.trim();
    const email = (overlay.querySelector('#signup-email') as HTMLInputElement).value.trim();
    const password = (overlay.querySelector('#signup-password') as HTMLInputElement).value;

    if (!username || !email || !password) {
      showError('signup-error', 'Please fill in all fields.');
      return;
    }
    if (username.length < 3) {
      showError('signup-error', 'Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      showError('signup-error', 'Password must be at least 6 characters.');
      return;
    }

    gameStore.login(username);
    hideOverlay(overlay, onComplete);
  });

  // Guest mode
  overlay.querySelector('#btn-guest')!.addEventListener('click', () => {
    gameStore.playAsGuest();
    hideOverlay(overlay, onComplete);
  });
}

function showError(id: string, message: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function hideOverlay(overlay: HTMLElement, callback: () => void) {
  overlay.style.transition = 'opacity 0.5s ease';
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.style.opacity = '1';
    callback();
  }, 500);
}
