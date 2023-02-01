export const HANDLE_LOCAL_REGEX = /^([a-z0-9_]+)$/i;
export const HANDLE_REGEX = /^@?([a-z0-9_]+([a-z0-9_.-]+[a-z0-9_]+)?)$/i;
export const FULL_HANDLE_REGEX =
  /^@?([a-z0-9_]+([a-z0-9_.-]+[a-z0-9_]+)?)(@((?!-)[-0-9a-z]{1,63}(?<!-)(?:\.(?!-)[-0-9a-z]{1,63}(?<!-))*))?$/i;
export const EMAIL_REGEX =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
