export default {
  // eslint
  '*.{js,ts,tsx,jsx}': ['prettier --write', 'eslint --cache --fix'],
  '*.{vue}': ['stylelint --fix', 'prettier --write', 'eslint --cache --fix'],
  '*.{less,css}': ['stylelint --fix', 'prettier --write'],
  // typecheck
  'packages/renderer/**/{*.ts,*.tsx,*.vue,tsconfig.json}': ({ filenames }) => 'npm run typecheck'
}
