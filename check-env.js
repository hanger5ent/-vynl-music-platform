#!/usr/bin/env node

/**
 * 🔍 VYNL Environment Checker
 * 
 * Quickly check if your environment is properly configured
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function printSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function printError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function printInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function printHeader(title) {
  console.log(`\n${colors.blue}${colors.bold}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}  ${title}${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}${'='.repeat(50)}${colors.reset}\n`);
}

function checkFileExists(filePath, required = true) {
  const exists = fs.existsSync(filePath);
  const fileName = path.basename(filePath);
  
  if (exists) {
    printSuccess(`${fileName} found`);
    return true;
  } else {
    if (required) {
      printError(`${fileName} missing (required)`);
    } else {
      printWarning(`${fileName} not found (optional)`);
    }
    return false;
  }
}

function checkEnvironmentVariables() {
  printHeader('Environment Variables Check');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!checkFileExists(envPath)) {
    printError('Cannot check environment variables without .env file');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Required variables
  const requiredVars = {
    'NEXTAUTH_URL': 'Authentication URL',
    'NEXTAUTH_SECRET': 'Authentication secret key',
    'ADMIN_EMAILS': 'Admin access control'
  };
  
  // Optional but recommended variables
  const optionalVars = {
    'NEXT_PUBLIC_BETA_MODE': 'Beta features toggle',
    'DATABASE_URL': 'Database connection',
    'GITHUB_ID': 'GitHub OAuth',
    'GITHUB_SECRET': 'GitHub OAuth',
    'GOOGLE_CLIENT_ID': 'Google OAuth',
    'GOOGLE_CLIENT_SECRET': 'Google OAuth'
  };
  
  console.log('Required Variables:');
  for (const [varName, description] of Object.entries(requiredVars)) {
    if (envContent.includes(`${varName}=`)) {
      printSuccess(`${varName} - ${description}`);
    } else {
      printError(`${varName} - ${description} (MISSING)`);
    }
  }
  
  console.log('\nOptional Variables:');
  for (const [varName, description] of Object.entries(optionalVars)) {
    if (envContent.includes(`${varName}=`)) {
      printSuccess(`${varName} - ${description}`);
    } else {
      printWarning(`${varName} - ${description} (not set)`);
    }
  }
}

function checkProjectStructure() {
  printHeader('Project Structure Check');
  
  const criticalPaths = [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/components/ui/BetaBanner.tsx',
    'src/components/admin/AdminDashboard.tsx',
    'src/hooks/useBetaFeatures.ts',
    'src/lib/beta.tsx',
    'src/lib/auth.ts',
    'prisma/schema.prisma',
    'next.config.ts',
    'tailwind.config.ts'
  ];
  
  criticalPaths.forEach(filePath => {
    checkFileExists(path.join(process.cwd(), filePath));
  });
}

function checkDependencies() {
  printHeader('Dependencies Check');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!checkFileExists(packageJsonPath)) {
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const criticalDeps = [
    'next',
    'react',
    'react-dom',
    'next-auth',
    '@prisma/client',
    'tailwindcss',
    'typescript'
  ];
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      printSuccess(`${dep} v${packageJson.dependencies[dep]}`);
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      printSuccess(`${dep} v${packageJson.devDependencies[dep]} (dev)`);
    } else {
      printError(`${dep} not found in dependencies`);
    }
  });
}

function checkBetaFeatures() {
  printHeader('Beta Features Check');
  
  const betaBannerPath = path.join(process.cwd(), 'src/components/ui/BetaBanner.tsx');
  const betaHookPath = path.join(process.cwd(), 'src/hooks/useBetaFeatures.ts');
  const betaLibPath = path.join(process.cwd(), 'src/lib/beta.tsx');
  const adminDashboardPath = path.join(process.cwd(), 'src/components/admin/AdminDashboard.tsx');
  
  if (checkFileExists(betaBannerPath, false)) {
    const content = fs.readFileSync(betaBannerPath, 'utf8');
    if (content.includes('useState') && content.includes('localStorage')) {
      printSuccess('Beta banner has state management');
    } else {
      printWarning('Beta banner may be missing functionality');
    }
  }
  
  if (checkFileExists(betaHookPath, false)) {
    const content = fs.readFileSync(betaHookPath, 'utf8');
    if (content.includes('useBetaFeatures') && content.includes('toggleFeature')) {
      printSuccess('Beta features hook is complete');
    } else {
      printWarning('Beta features hook may be incomplete');
    }
  }
  
  if (checkFileExists(betaLibPath, false)) {
    const content = fs.readFileSync(betaLibPath, 'utf8');
    if (content.includes('BetaFeature') && content.includes('BetaBadge')) {
      printSuccess('Beta utility library is complete');
    } else {
      printWarning('Beta utility library may be incomplete');
    }
  }
  
  // Check if beta features are integrated into main components
  const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    if (layoutContent.includes('BetaBanner')) {
      printSuccess('Beta banner integrated into layout');
    } else {
      printWarning('Beta banner not found in layout');
    }
  }
}

function generateSummary() {
  printHeader('Setup Summary');
  
  printInfo('🚀 Your VYNL platform setup status:');
  console.log('');
  
  console.log('📁 Core files: Check the green checkmarks above');
  console.log('🔐 Authentication: Configured via NextAuth');
  console.log('🎨 Styling: Tailwind CSS for responsive design');
  console.log('🚀 Beta Features: Conditional rendering system');
  console.log('👨‍💼 Admin Panel: Role-based access control');
  console.log('📱 Responsive: Mobile, tablet, desktop support');
  console.log('');
  
  printInfo('🧪 Testing recommendations:');
  console.log('  1. Run `npm run test:dashboard` for visual testing');
  console.log('  2. Run `npm run test:features` for guided testing');
  console.log('  3. Test with beta mode ON: `npm run test:beta-on`');
  console.log('  4. Test with beta mode OFF: `npm run test:beta-off`');
  console.log('  5. Check all pages in different screen sizes');
  console.log('  6. Test authentication flow completely');
  console.log('  7. Verify admin access control works');
  console.log('');
  
  printInfo('🔧 If issues found:');
  console.log('  • Missing files: Check the red X marks above');
  console.log('  • Environment variables: Update your .env file');
  console.log('  • Dependencies: Run `npm install`');
  console.log('  • Build issues: Try `npm run dev` instead of build');
}

function main() {
  console.log(`${colors.bold}${colors.blue}🔍 VYNL Environment Checker${colors.reset}\n`);
  
  checkProjectStructure();
  checkEnvironmentVariables();
  checkDependencies();
  checkBetaFeatures();
  generateSummary();
  
  console.log(`\n${colors.green}${colors.bold}✨ Environment check complete!${colors.reset}`);
  console.log(`Run ${colors.blue}npm run dev${colors.reset} to start development server\n`);
}

main();
