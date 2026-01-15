# Release Instructions

Follow the steps below to tag a new release for the `elastic/otel-context-action` action.

1. Update the `version` field in package.json.
1. Merge the latest changes to the `main` branch.
1. Create a new release using a tag of the form `vX.X.X` following SemVer
   conventions:

   ```shell
   gh release create vX.X.X
   ```

1. Move (or create) the major version tag to point to the same commit tagged
   above:

   ```shell
   git tag -fa vX -m "vX"
   git push origin vX --force
   ```
