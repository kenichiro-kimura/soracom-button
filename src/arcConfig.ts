export class WireguardConfig {
    readonly privateKey: string;
    readonly serverPeerPublicKey: string;
    readonly serverEndpoint: string;
    readonly allowedIPs: string[];
    readonly clientPeerIpAddress: string;

    constructor(privateKey: string, serverPeerPublicKey: string, serverEndpoint: string, allowedIPs: string[], clientPeerIpAddress: string) {
        this.privateKey = privateKey;
        this.serverPeerPublicKey = serverPeerPublicKey;
        this.serverEndpoint = serverEndpoint;
        this.allowedIPs = allowedIPs;
        this.clientPeerIpAddress = clientPeerIpAddress.split('/')[0];
    }

    static fromConfigText = (text: string): WireguardConfig => {
        const lines = text.split(/\r\n|\n|\r/).map(l => l.trim());
        let privateKey = '';
        let clientPeerIpAddress = '';
        let serverPeerPublicKey = '';
        let serverEndpoint = '';
        let allowedIPs: string[] = [];
      
        for (const line of lines) {
          if (line.startsWith('PrivateKey')) {
            privateKey = line.split('=').slice(1).join('=').trim();
          } else if (line.startsWith('Address')) {
            clientPeerIpAddress = line.split('=')[1].split('/')[0].trim().replace(/,.*/, '');
          } else if (line.startsWith('PublicKey')) {
            serverPeerPublicKey = line.split('=').slice(1).join('=').trim();
          } else if (line.startsWith('AllowedIPs')) {
            allowedIPs = line.split('=')[1].split(',').map(ip => ip.trim());
          } else if (line.startsWith('Endpoint')) {
            serverEndpoint = line.split('=')[1].trim();
          }
        }
      
        return new WireguardConfig(
          privateKey,
          serverPeerPublicKey,
          serverEndpoint,
          allowedIPs,
          clientPeerIpAddress
        );
    }

    configText = (): string =>{
        return `[Interface]
PrivateKey = ${this.privateKey}
Address = ${this.clientPeerIpAddress}/32

[Peer]
PublicKey = ${this.serverPeerPublicKey}
AllowedIPs = ${this.allowedIPs.join(', ')}
Endpoint = ${this.serverEndpoint}
`;
    }     
}

export class ArcConfig {
    readonly privateKey: string;
    readonly logLevel: number;
    readonly arcSessionStatus: {
        arcServerPeerPublicKey: string;
        arcServerEndpoint: string;
        arcAllowedIPs: string[];
        arcClientPeerIpAddress: string;
    }
    
    constructor(privateKey: string, logLevel: number, arcServerPeerPublicKey: string, arcServerEndpoint: string, arcAllowedIPs: string[], arcClientPeerIpAddress: string) {
        this.privateKey = privateKey;
        this.logLevel = logLevel;
        this.arcSessionStatus = {
            arcServerPeerPublicKey: arcServerPeerPublicKey,
            arcServerEndpoint: arcServerEndpoint,
            arcAllowedIPs: arcAllowedIPs,
            arcClientPeerIpAddress: arcClientPeerIpAddress
        };
    }

    static fromWireguardConfig(wireguardconfig:WireguardConfig): ArcConfig {
        return new ArcConfig(
                wireguardconfig.privateKey,
                0, // Default log level
                wireguardconfig.serverPeerPublicKey,
                wireguardconfig.serverEndpoint,
                wireguardconfig.allowedIPs,
                wireguardconfig.clientPeerIpAddress
            );
    }

    hasArcConfig = (): boolean =>  {
        return this.privateKey !== ""
          && this.arcSessionStatus.arcServerPeerPublicKey !== ""
          && this.arcSessionStatus.arcServerEndpoint !== ""
          && this.arcSessionStatus.arcAllowedIPs.length > 0
          && this.arcSessionStatus.arcClientPeerIpAddress !== "";
      }
      
    setLogLevel = (logLevel: number): ArcConfig => {
        return new ArcConfig(
            this.privateKey,
            logLevel,
            this.arcSessionStatus.arcServerPeerPublicKey,
            this.arcSessionStatus.arcServerEndpoint,
            this.arcSessionStatus.arcAllowedIPs,
            this.arcSessionStatus.arcClientPeerIpAddress
        );
    }
}
