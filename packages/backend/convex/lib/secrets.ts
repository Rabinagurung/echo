import { 
    CreateSecretCommand, 
    GetSecretValueCommand, 
    GetSecretValueCommandOutput, 
    PutSecretValueCommand, 
    ResourceExistsException,
    SecretsManagerClient 
} from "@aws-sdk/client-secrets-manager";


/**
 * Creates a preconfigured AWS Secrets Manager client.
 *
 * Uses `process.env.AWS_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.
 * Prefer letting the AWS SDK resolve credentials via its default provider chain
 * (env vars, shared config/credentials files, IAM role, etc.) whenever possible.
 *
 * @returns {SecretsManagerClient} A new Secrets Manager client instance.
 *
 * @example
 * const client = createSecretsManagerClient();
 * const out = await client.send(new GetSecretValueCommand({ SecretId: "my/secret" }));
 */
export function createSecretManagerClient():SecretsManagerClient{
    return new SecretsManagerClient({
        region: process.env.AWS_REGION, 

        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "", 
            secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY || ""
        }
    })
}



/**
 * Get a secret's current value by name.
 *
 * Note: Secrets Manager returns either `SecretString` (stringified JSON stored in AWS
 * This helper just fetches the value;
 * pair it with {@link parseSecretString} to turn `SecretString` into an object
 *
 * @param {string} secretName - The secret's name or full ARN.
 * @returns {Promise<GetSecretValueCommandOutput>} The raw AWS response with `SecretString` or `SecretBinary`.
 */
export async function getSecretValue(
    secretName:string
): Promise<GetSecretValueCommandOutput> {
    const client = createSecretManagerClient();
    return await client.send(new GetSecretValueCommand({SecretId: secretName}))
}; 



/**
 * Creates or updates (upserts) a secret whose value is a JSON object.
 *
 * Rationale: a third-party service may require multiple API keys (e.g., "publicKey", "secretKey"),
 * so we store a single secret containing an object with all keys. The value is stringified so it is
 * human-readable in the AWS console (`SecretString`).
 *
 * Behavior:
 * - Tries `CreateSecret`. If the secret already exists, catches `ResourceExistsException` and
 *   calls `PutSecretValue` to add a **new version** with the updated JSON payload.
 * - Any other error is rethrown unchanged.
 *
 * @param {string} secretName - Logical name or ARN for the secret (e.g., "org/xyz/vapi").
 * @param {Record<string, unknown>} secretValue - Arbitrary JSON serializable map of keys/values.
 * @returns {Promise<void>} Resolves when the operation completes.
 * @throws {Error} Rethrows non-existence-related AWS errors.
 */
export async function upsertSecret(
    secretName: string, 
    secretValue: Record<string, unknown>
): Promise<void> {

    const client = createSecretManagerClient(); 

    try {
        // Secret already exists — create a new version with updated value.
        await client.send(new CreateSecretCommand({
            Name: secretName, 
            SecretString: JSON.stringify(secretValue)
        }))
    } catch (error) {
        // Not an "exists" case — bubble up for caller to handle/log.
        if(error instanceof  ResourceExistsException) {
            await client.send(
                new PutSecretValueCommand({
                    SecretId: secretName, 
                    SecretString: JSON.stringify(secretValue)
                })
            )
        } else if (error instanceof Error && error.name === "ValidationException"){
            throw new Error(`Invalid secret name or value: ${error.message}`)
        } else if(error instanceof Error && error.name === "ResourceNotFoundException"){
            throw new Error(`Secret not found during update: ${secretName}`)
        } else {
            throw error;
        } 
    }
}


/**
 * Parses a `SecretString` from AWS into a JSON object.
 *
 * Returns `null` if the secret contains no `SecretString` (e.g., only binary) or if parsing fails.
 * Use a type parameter to strongly type the result when you know the shape.
 *
 * @template T
 * @param {GetSecretValueCommandOutput} secret - The AWS get-secret response.
 * @returns {T | null} The parsed object, or `null` if missing/invalid JSON.
 *
 * @example
 * type VapiSecret = { apiKey: string; apiSecret: string; region?: string };
 * const raw = await getSecretValue("org/xyz/vapi");
 * const vapi = parseSecretString<VapiSecret>(raw);
 * if (!vapi) throw new Error("Secret missing or invalid JSON");
 * console.log(vapi.apiKey);
 */
export function parseSecretString<T = Record<string, unknown>>(
    secret: GetSecretValueCommandOutput
): T | null{

    if(!secret.SecretString) return null;

    try {
        return JSON.parse(secret.SecretString) as T;
    } catch (error) {
        return null;
    }     
}