export function isValidCPF(cpf: string): boolean {
  if (typeof cpf !== "string") return false;
  
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11) return false;

  // Verifica CPFs com todos os números iguais (matematicamente são válidos, mas logicamente falsos)
  const allEqualMatch = cleanCPF.match(/^(\d)\1*$/);
  if (allEqualMatch) return false;

  // Validação do Primeiro Dígito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  // Validação do Segundo Dígito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}
