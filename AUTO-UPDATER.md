## Testing the Updater

To test the updater functionality, you’ll need a build that points to a local release server. We use `http-server` to serve the `dist` folder locally.

Note the desired behaviour is that the App should check and notify the user of updates when a new version is available. But refrain from installing the update automatically. The user should have the option to install the update when they are ready.

### 1. Configure the Update Server

Edit the `electron-builder.yml` file to point to a local HTTP server instead of the remote provider (GitHub):

```yaml
publish:
  provider: generic
  url: http://localhost:8080
```

This configuration ensures the app checks for updates from the local server during testing.

---

### 2. Build and Host the Current Version

1. **Build the Current Main Version**:
   Run the build command to generate the current version of your app:

   ```bash
   npm run build
   ```

2. **Serve the `dist` Folder Locally**:
   Start the `http-server` to host the build output:

   ```bash
   npm run dev:dist
   ```

3. **Install the App**:
   Install and open the app to ensure it works as expected. It should report that the app is up to date.

---

### 3. Create a New Version

1. **Update the Version Number**:
   Increment the version number in your `package.json` file:

   ```json
   {
     "version": "1.0.1" // Example: Increment from 1.0.0 to 1.0.1
   }
   ```

2. **Build the New Version**:
   Generate the new version by running the build command again:

   ```bash
   npm run build
   ```

3. **Recap**:
   At this point, you should have:

- The **old version installed** and pointing to the local HTTP server.
- The **new version built** and available in the `dist` folder.

---

### 4. Test the Update Flow

1. **Open the Old Version**:
   Launch the previously installed app. It should detect the new version served by the local HTTP server.

2. **Verify Update Behavior**:
   Ensure the update flow behaves as expected:

- The app should notify you of the available update.
- It should download and apply the update.
- After restarting, the app should run the new version.

---

### 5. Repeat Testing

Continue to build new versions and test the update flow to ensure the updater works as expected.

Be sure to roll back the changes to the `electron-builder.yml` and `package.json` file before committing.
