
if [ -d "./docs" ]; then
  rm -rf "./docs"
fi

hardhat docgen

prettier --write docs


if [[ "$OSTYPE" == "darwin"* ]]; then
    find docs -name '*.md' -type f -exec sed -i '' 's/\\_//g' {} +
else
    find ./docs -name '*.md' -type f -exec sed -i 's/\\_//g' {} +
fi

# cp README.md docs/
