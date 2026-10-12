/** Normaliza texto livre vindo de visitantes antes de usar em prompts ou persistir. */
export function cleanText(input: string, max: number) {
  return input
    .normalize("NFKC")
    // remove caracteres de controle (mantém \n e \t)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, max);
}

export function isHexColor(v: string) {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}
