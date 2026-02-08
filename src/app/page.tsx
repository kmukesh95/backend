"use client";
import { createDecipheriv, createCipheriv, randomBytes } from "crypto";
import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [decryptValue, setDecryptValue] = useState("");
  const [encryptValue, setEncryptValue] = useState("");
  const [inputType, setInputType] = useState(1);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("decrypt");

  const algorithm = "aes-256-gcm";
  const ivLength = 12;
  const key: any = Buffer.from(
    inputType != 1 ? '91b36c1b6cce8a1c35f4d1e9d3e1b1ff9c23b7d3b4e4e5d6f7e8a1b2c3d4e5f6' : 'e69111bbe4c4ecf85f2db35cb36f6c6beddb34cdf7f141c379ade3e1298e3a51',
    "hex"
  ); //Live = e69111bbe4c4ecf85f2db35cb36f6c6beddb34cdf7f141c379ade3e1298e3a51
  // staging = 91b36c1b6cce8a1c35f4d1e9d3e1b1ff9c23b7d3b4e4e5d6f7e8a1b2c3d4e5f6

  const encrypt = (plainText: string): string => {
    const iv: any = randomBytes(ivLength);
    const cipher = createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag: any = cipher.getAuthTag();

    const combinedBuffer = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, "hex"),
    ]);

    return combinedBuffer.toString("base64");
  };

  const decrypt = (base64Data: string): string => {
    const combinedBuffer = Buffer.from(base64Data, "base64");

    const iv: any = combinedBuffer.subarray(0, ivLength);
    const authTag: any = combinedBuffer.subarray(ivLength, ivLength + 16);
    const encryptedData = combinedBuffer
      .subarray(ivLength + 16)
      .toString("hex");

    const decipher = createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleEncrypt = () => {
    try {
      const encryptedValue = encrypt(inputValue);
      setEncryptValue(encryptedValue);
    } catch (error) {
      console.error("Encryption error:", error);
      setEncryptValue("Error encrypting the input.");
    }
  };

  const handleSubmit = () => {
    try {
      const decryptInputValue = decrypt(inputValue);
      const parsedValue = JSON.parse(decryptInputValue);
      setDecryptValue(parsedValue);
    } catch (error) {
      console.error("Decryption or parsing error:", error);
      setDecryptValue("Error decrypting or parsing the input.");
    }
  };

  const handleClear = () => {
    setDecryptValue("");
    setEncryptValue("");
    setInputValue("");
  };

  return (
    <>
      <div className="container">
        <div className="main-content">
          <h1>{mode === "encrypt" ? "Enter Text To Encrypt" : "Enter Text To Decrypt"}</h1>
          <div style={{ marginBottom: "10px" }}>
            <button 
              onClick={() => setMode("encrypt")} 
              style={{ 
                marginRight: "10px", 
                padding: "8px 16px",
                backgroundColor: mode === "encrypt" ? "#4CAF50" : "#ccc",
                color: mode === "encrypt" ? "white" : "black",
                border: "none",
                cursor: "pointer"
              }}
            >
              Encrypt
            </button>
            <button 
              onClick={() => setMode("decrypt")}
              style={{ 
                padding: "8px 16px",
                backgroundColor: mode === "decrypt" ? "#4CAF50" : "#ccc",
                color: mode === "decrypt" ? "white" : "black",
                border: "none",
                cursor: "pointer"
              }}
            >
              Decrypt
            </button>
          </div>
          <div>Type : {inputType}
            <button onClick={() => setInputType(1)}>Live</button>
            <button onClick={() => setInputType(2)}>Staging</button>
          </div>
          <input
            type={"text"}
            id={"input-text"}
            name={"input-text"}
            value={inputValue}
            placeholder={mode === "encrypt" ? "Enter JSON String To Encrypt" : "Enter Text To Decrypt"}
            onChange={handleChange}
          />
          <div className="btns">
            <button 
              onClick={mode === "encrypt" ? handleEncrypt : handleSubmit} 
              className="btn btn-green"
            >
              {mode === "encrypt" ? "Encrypt" : "Decrypt"}
            </button>
            <button onClick={handleClear} className="btn btn-grey">
              Clear
            </button>
          </div>
          {mode === "encrypt" ? (
            <>
              <h4>Encrypted Data</h4>
              <div className="content">
                {encryptValue ? <pre>{encryptValue}</pre> : <pre>Response will be shown here...!!</pre>}
              </div>
            </>
          ) : (
            <>
              <h4>Decrypted Data</h4>
              <div className="content">
                {decryptValue ? <pre>{JSON.stringify(decryptValue, null, 2)}</pre> : <pre>Response will be shown here...!!</pre>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
