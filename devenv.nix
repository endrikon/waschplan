{ pkgs, lib, config, inputs, ... }:

{
  languages.rust.enable = true;
  cachix.enable = false;

  packages = [
    pkgs.openssl
    pkgs.pkg-config
  ];
}
