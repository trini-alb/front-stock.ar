const { Builder, By } = require('selenium-webdriver');

(async () => {
  const URL_LOGIN = 'http://localhost:3000/Login.html'; // ajusta tu URL
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get(URL_LOGIN);

    const email   = await driver.findElement(By.css('[data-testid="login-email"]'));
    const pass    = await driver.findElement(By.css('[data-testid="login-password"]'));
    const submit  = await driver.findElement(By.css('[data-testid="login-submit"]'));

    // 1) Click en submit con campos vacíos
    await submit.click();

    // 2) Verificar que el navegador marcó inválido (HTML5 constraint validation)
    const valueMissingEmail = await driver.executeScript(
      'return arguments[0].validity.valueMissing;', email
    );
    const valueMissingPass = await driver.executeScript(
      'return arguments[0].validity.valueMissing;', pass
    );

    if (!valueMissingEmail || !valueMissingPass) {
      throw new Error('El formulario no marcó como vacíos los campos requeridos.');
    }

    // (Opcional) El mensaje nativo del navegador no esté vacío
    const msgEmail = await driver.executeScript(
      'return arguments[0].validationMessage;', email
    );
    const msgPass = await driver.executeScript(
      'return arguments[0].validationMessage;', pass
    );
    if (!msgEmail || !msgPass) {
      throw new Error('Faltan mensajes nativos de validación en campos vacíos.');
    }

    // 3) Verificar que NO hubo navegación
    const urlAfter = await driver.getCurrentUrl();
    if (urlAfter !== URL_LOGIN) {
      throw new Error('El formulario se envió aunque los campos estaban vacíos.');
    }

    console.log('✅ L2 OK: required bloquea el submit con campos vacíos.');
  } catch (e) {
    console.error('❌ L2 FALLÓ:', e.message);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
})();
