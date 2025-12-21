let
  pkgs = import <nixpkgs> {};
in
  pkgs.mkShell {
    nativeBuildInputs = with pkgs; [
      pkg-config
      gobject-introspection
      cargo
      cargo-tauri
      rustc
      nodejs
      openssl
      typescript
    ];

    buildInputs = with pkgs; [
      at-spi2-atk
      atkmm
      cairo
      gdk-pixbuf
      glib
      gtk3
      harfbuzz
      librsvg
      libsoup_3
      pango
      webkitgtk_4_1
      openssl
    ];
    GIO_EXTRA_MODULES = ["${pkgs.glib-networking.out}/lib/gio/modules"];
  }
