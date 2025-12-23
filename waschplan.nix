pkgs:
with pkgs;
  rustPlatform.buildRustPackage (finalAttrs: {
    name = "waschplan";
    pname = "waschplan";
    version = "0.1.0";
    src = ./app;
    cargoHash = "sha256-tQWHXdnX1Xyu+URVaOAbwZzXZBP+FRP1A8dCfReTHrM=";

    # Assuming our app's frontend uses `npm` as a package manager
    npmDeps = fetchNpmDeps {
      name = "${finalAttrs.pname}-${finalAttrs.version}-npm-deps";
      inherit (finalAttrs) src;
      hash = "sha256-RTsLnB+kLp47nm393qWU9kXCVDTt6kupLSPsMrvrJMI=";
      dontPatchShebangs = true;
    };

    nativeBuildInputs = with pkgs;
      [
        # Pull in our main hook
        cargo-tauri.hook

        # Setup npm
        nodejs
        npmHooks.npmConfigHook

        # Make sure we can find our libraries
        pkg-config
      ]
      ++ lib.optionals stdenv.hostPlatform.isLinux [wrapGAppsHook4];

    buildInputs = lib.optionals stdenv.hostPlatform.isLinux [
      glib-networking # Most Tauri apps need networking
      openssl
      webkitgtk_4_1
    ];

    # Set our Tauri source directory
    cargoRoot = "src-tauri";
    # cargoLock = {
    #   lockFile = ./app/src-tauri/Cargo.lock;
    # };
    # And make sure we build there too
    buildAndTestSubdir = finalAttrs.cargoRoot;
  })
