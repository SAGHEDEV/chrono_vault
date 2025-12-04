
// export default function DemoSeal() {
//   const { loading, result, error, runSealIntegration } = useSealIntegration();

//   return (
//     <div>
//       <button
//         disabled={loading}
//         onClick={() => runSealIntegration()}
//       >
//         {loading ? "Encrypting..." : "Run Seal Integration"}
//       </button>

//       {error && <p style={{ color: "red" }}>Error: {error}</p>}

//       {result && (
//         <div>
//           <p>Encrypted size: {result.encryptedSize} bytes</p>
//           <p>Backup key: {Buffer.from(result.backupKey).toString("hex")}</p>
//         </div>
//       )}
//     </div>
//   );
// }
