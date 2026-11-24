const fs = require('node:fs');
const path = require('node:path');

const targets = [
  'node_modules/react-native-nitro-google-signin/android/src/main/java/com/nitrogooglesignin/GoogleSignInButtonViewManager.kt',
  'node_modules/react-native-nitro-google-signin/nitrogen/generated/android/kotlin/com/margelo/nitro/nitrogooglesignin/views/HybridGoogleSignInButtonManager.kt',
];

// Kotlin 2.4 rejects a statically impossible `is RecyclableView` check. Keep
// that runtime check intact by widening its reference to Any first.
for (const relativePath of targets) {
  const filePath = path.join(process.cwd(), relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected Nitro Google Sign-In source was not found: ${relativePath}`);
  }

  const source = fs.readFileSync(filePath, 'utf8');
  let patched = source.replace(
    /val hybridView = holder\.hybridView(?=\n\s*holder\.lastState = null)/,
    'val hybridView: Any = holder.hybridView',
  );

  patched = patched.replace(
    /val hybridView: Any = holder\.hybridView\n(?!\s*val nativeView = holder\.hybridView\.view)/,
    'val hybridView: Any = holder.hybridView\n    val nativeView = holder.hybridView.view\n',
  );
  patched = patched.replaceAll('    val hybridViewView = holder.hybridView.view\n', '');
  patched = patched.replaceAll('return hybridViewView', 'return nativeView');
  patched = patched.replaceAll('return hybridView.view', 'return nativeView');

  if (patched === source && !source.includes('val hybridView: Any = holder.hybridView')) {
    throw new Error(`Could not apply Kotlin 2.4 compatibility patch to ${relativePath}`);
  }

  if (patched !== source) {
    fs.writeFileSync(filePath, patched);
  }
}
