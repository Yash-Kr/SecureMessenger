class Cryptography {
    constructor(){
        this.saltBytes = [180,253,62,216,47,35,90,55,218,233,103,10,172,143,161,177];
        this.ivBytes = [212,187,26,247,172,51,37,151,27,177,249,142];
    }

    ab2str = (buf) => {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    str2ab = (str) => {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    uint82str = (arr) => {
        var str = String.fromCharCode.apply(null, arr);
        return str;
    }

    arrayBufferToBase64 = ( buffer ) => {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }
    
    
    
    base64ToArrayBuffer = (base64) => {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }



    pem2ab = (pem) => {
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = pem.toString().substring(pemHeader.length, pem.length - pemFooter.length);
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        return this.str2ab(binaryDerString)
    }

    pubpem2ab = (pem) => {
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = pem.toString().substring(pemHeader.length, pem.length - pemFooter.length);
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        return this.str2ab(binaryDerString)
    }

    exportCryptoKey = async (key) => {
        const exported = await window.crypto.subtle.exportKey(
          "spki",
          key
        );
        const exportedAsString = this.ab2str(exported);
        const exportedAsBase64 = window.btoa(exportedAsString);
        const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
      
       
        return pemExported;
      }

      
      

    importPrivateKey = (pem) => {
        // fetch the part of the PEM string between header and footer
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
       
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        const binaryDer = this.str2ab(binaryDerString);
      
        return window.crypto.subtle.importKey(
          "pkcs8",
          binaryDer,
          {
            name: "RSA-OAEP",
            hash: "SHA-256",
          },
          true,
          ["decrypt"]
        );
      }

      importRsaKey = (pem) => {
        // fetch the part of the PEM string between header and footer
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        const binaryDer = this.str2ab(binaryDerString);
    
        return window.crypto.subtle.importKey(
          "spki",
          binaryDer,
          {
            name: "RSA-OAEP",
            hash: "SHA-256"
          },
          true,
          ["encrypt"]
        );
      }

    WrappedKeyToPemString = async (array_buffer_of_key) => {           
        const exportedAsString = this.ab2str(array_buffer_of_key);
        const exportedAsBase64 = window.btoa(exportedAsString);
        const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
        //const exportKeyOutput = document.querySelector(".private-wrapped");
        //exportKeyOutput.textContent = pemExported;
        return pemExported
    }

    OriginalKeyToPemString = async (key) => {
        const exported = await window.crypto.subtle.exportKey(
            "pkcs8",
            key
        );
        const exportedAsString = this.ab2str(exported);
        const exportedAsBase64 = window.btoa(exportedAsString);
        const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;

        return pemExported
    }

    

    bytesToArrayBuffer = (bytes) => {
        const bytesAsArrayBuffer = new ArrayBuffer(bytes.length);
        const bytesUint8 = new Uint8Array(bytesAsArrayBuffer);
        bytesUint8.set(bytes);
        return bytesAsArrayBuffer;
        }

    /*
        Get some key material to use as input to the deriveKey method.
        The key material is a password supplied by the user.
    */
    getKeyMaterial = (password) => {
        const enc = new TextEncoder();
        return window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            {name: "PBKDF2"},
            false,
            ["deriveBits", "deriveKey"]
        );
        }

    /*
        Given some key material and some random salt
        derive an AES-GCM key using PBKDF2.
    */
    getKey = (keyMaterial, salt) => {
        return window.crypto.subtle.deriveKey(
            {
            "name": "PBKDF2",
            salt: salt,
            "iterations": 100000,
            "hash": "SHA-256"
            },
            keyMaterial,
            { "name": "AES-GCM", "length": 256},
            true,
            [ "wrapKey", "unwrapKey" ]
        );
        }

        /*
        Wrap the given key.
        */
    wrapCryptoKey = async (keyToWrap, password) => {
        // get the key encryption key
        const keyMaterial = await this.getKeyMaterial(password);
        const saltBuffer = this.bytesToArrayBuffer(this.saltBytes);
        const wrappingKey = await this.getKey(keyMaterial, saltBuffer);
        const iv = this.bytesToArrayBuffer(this.ivBytes);
        return window.crypto.subtle.wrapKey(
            "pkcs8",
            keyToWrap,
            wrappingKey,
            {
            name: "AES-GCM",
            iv: iv
            }
        );
        }

    generateCryptoKeyPair =  () => {
        console.log("Generating crypto key pair....")
        return  window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            // Consider using a 4096-bit key for systems that require long-term security
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
        )   
    }


    getUnwrappingKey = async (password) => {
        // 1. get the key material (user-supplied password)
        const keyMaterial = await this.getKeyMaterial(password);
        const saltBuffer = this.bytesToArrayBuffer(this.saltBytes);
        // 3 derive the key from key material and salt
        return window.crypto.subtle.deriveKey(
            {
            "name": "PBKDF2",
            salt: saltBuffer,
            "iterations": 100000,
            "hash": "SHA-256"
            },
            keyMaterial,
            { "name": "AES-GCM", "length": 256},
            true,
            [ "wrapKey", "unwrapKey" ]
        );
        }

    /*
        Unwrap an RSA-PSS private signing key from an ArrayBuffer containing
        the raw bytes.
        Takes an array containing the bytes, and returns a Promise
        that will resolve to a CryptoKey representing the private key.
    */
       
    unwrapPrivateKey = async (wrappedKeyBuffer,password) => {
            // 1. get the unwrapping key
            const unwrappingKey = await this.getUnwrappingKey(password);
            // 3. initialize the iv
            const ivBuffer = this.bytesToArrayBuffer(this.ivBytes);
            // 4. unwrap the key
            return window.crypto.subtle.unwrapKey(
                "pkcs8",               // import format
                wrappedKeyBuffer,      // ArrayBuffer representing key to unwrap
                unwrappingKey,         // CryptoKey representing key encryption key
                {                      // algorithm params for key encryption key
                name: "AES-GCM",
                iv: ivBuffer
                },
                {                      // algorithm params for key to unwrap
                name: "RSA-OAEP",
                hash: "SHA-256"
                },
                true,                  // extractability of key to unwrap
                [ "decrypt"]             // key usages for key to unwrap
            );
    }

    getMessageEncoding = (message) => {
        let enc = new TextEncoder();
        return enc.encode(message);
      }
      
    encryptMessage = (publicKey,message) => {
        let encoded = this.getMessageEncoding(message);
        return window.crypto.subtle.encrypt(
          {
            name: "RSA-OAEP"
          },
          publicKey,
          encoded
        );
      }

    decryptMessage = (privateKey, ciphertext) => {
        return window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP"
          },
          privateKey,
          ciphertext
        );
      }

      
      
      /*
      Wrap the given key.
      */
      // wrapAESKey =  async (keyToWrap) => {
      //   // get the key encryption key
      //   const keyMaterial = await this.getKeyMaterial();
      //   const saltBuffer = this.bytesToArrayBuffer(this.saltBytes);
      //   const wrappingKey = await this.getKey(keyMaterial, saltBuffer);
      //   const iv = this.bytesToArrayBuffer(this.ivBytes);
      //   return window.crypto.subtle.wrapKey(
      //     "raw",
      //     keyToWrap,
      //     wrappingKey,
      //     {
      //       name : "AES-GCM",
      //       iv:iv,
      //     }
      //   );
      // }

      // unwrapSecretKey = async (wrappedKey) => {
      //   // 1. get the unwrapping key
      //   const unwrappingKey = await this.getUnwrappingKey();
      //   // 2. initialize the wrapped key
      //   const wrappedKeyBuffer = wrappedKey;
      //   const iv = this.bytesToArrayBuffer(this.ivBytes);
      //   // 3. unwrap the key
      //   return window.crypto.subtle.unwrapKey(
      //     "raw",                 // import format
      //     wrappedKeyBuffer,      // ArrayBuffer representing key to unwrap
      //     unwrappingKey,         // CryptoKey representing key encryption key
      //     {
      //       name : "AES-GCM",
      //       iv:iv,
      //     },              // algorithm identifier for key encryption key
      //     {
      //       name : "AES-GCM",
      //       iv:iv,
      //     },             // algorithm identifier for key to unwrap
      //     true,                  // extractability of key to unwrap
      //     ["encrypt", "decrypt"] // key usages for key to unwrap
      //   );
      // }


      // exportAESKey = async (key) => {
      //   const exported = await window.crypto.subtle.exportKey(
      //     "raw",
      //     key
      //   );
      //   const exportedKeyBuffer = new Uint8Array(exported);
      
      //   return exportedKeyBuffer;
      // }
      

      // generateAESKey =  () => {
      //   console.log("Generating AES")
      //   return window.crypto.subtle.generateKey(
      //       {
      //         name: "AES-GCM",
      //         length: 256
      //       },
      //       true,
      //       ["encrypt", "decrypt"]
      //     );
    // }

      
      


    performQueries =  async () => {
        let keyPair = await this.generateCryptoKeyPair();  // Step 01 : Generate Public Private Key Pair
      
        let original_pem = await this.OriginalKeyToPemString(keyPair.privateKey)  // Step 02 : Private key ka string version
        let public_pem = await this.exportCryptoKey(keyPair.publicKey)    // Step 03 : Public key ka string version
       
    
        let wrapped_key_buffer = await this.wrapCryptoKey(keyPair.privateKey);   // Step 04 : private key wrapped to an array buffer
        let wrapped_pem = await this.WrappedKeyToPemString(wrapped_key_buffer) // Step 05 : that array buffer ka string version  ( push to firebase )
        let private_buff = this.pem2ab(wrapped_pem);     // Step 06 : wrapped private key ka string version converted to an array buffer  ( get from firebase )

        let pub_key = await this.importRsaKey(public_pem)  //Step 07 : public key ke string version se derive actual public key  ( get from firebase )
        let unwrapped_key = await this.unwrapPrivateKey(private_buff,"yash");   //Step 07 : Array buffer of step 6 used to derive original private key 
        //let uwrapped_pem = await this.OriginalKeyToPemString(unwrapped_key)  kaam nahi hai kyuki private key mill chuka hai step 7 me
        //let pri_key = await this.importPrivateKey(uwrapped_pem)   kaam nahi hai kyuki private key mill chuka hai step 7 me
      
        let cipher = await this.encryptMessage(pub_key,"Hello");
        let readable = this.arrayBufferToBase64(cipher)
        console.log(readable)
        let plain = await this.decryptMessage(unwrapped_key, cipher);
        console.log(this.ab2str(plain))


        // let aes = await this.generateAESKey();      //Step a : Generate AES KEY
        // let aes_raw =  await this.exportAESKey(aes) 
        // console.log(aes_raw)

        // let wrapped_aes = await this.wrapAESKey(aes);   //Step b : Get array buffer of wrapped aes
        // let wrapped_aes_str = this.arrayBufferToBase64(wrapped_aes);  //convert that array buffer to base 64 string (send to firebase)
       
        // let aes_buff = this.base64ToArrayBuffer(wrapped_aes_str)  // get back the wrapped aes buff from string (fetch from firebase)

        // let uwrapped_aes = await this.unwrapSecretKey(aes_buff);
        // let uwrapped_aes_raw = await this.exportAESKey(uwrapped_aes);
        // console.log(uwrapped_aes_raw)
       
    }

    


}





export default new Cryptography();

