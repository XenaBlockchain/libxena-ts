import type { Networkish } from "../../common/types";
import type { NetworkParams} from "../../common/interfaces";
import BufferUtils from "../../utils/buffer.utils";
import { liveNetwork, Network, testNetwork } from "./network";

/**
 * NetworkManager is a singleton service, containing map values that correspond to version
 * numbers for each nexa network. Currently only supporting "mainnet"
 * (a.k.a. "livenet") and "testnet", with option to add custom networks.
 * 
 * @remarks should be used as singletone. 
 * 
 * @see {@linkcode NetworkManager.getInstance}
 */
export default class NetworkManager {

  private static readonly _instance = new NetworkManager();

  private networks = [ liveNetwork, testNetwork ];

  private _defaultNetwork = liveNetwork;

  public get mainnet(): Network {
    return liveNetwork;
  }

  /** @deprecated use mainnet */
  public get livenet(): Network {
    return liveNetwork;
  }

  public get testnet(): Network {
    return testNetwork;
  }

  public get defaultNetwork(): Network {
    return this._defaultNetwork;
  }

  public set defaultNetwork(network: Network) {
    this._defaultNetwork = network;
  }

  /**
   * @returns the singleton instance of NetworkManager
   */
  public static getInstance(): NetworkManager {
    return this._instance;
  }

  public get(arg?: Networkish | number, key?: keyof Network): Network | undefined {
    if (arg instanceof Network) {
      if (this.networks.includes(arg)) {
        return arg;
      }
      if (this.networks.map(n => n.name).includes(arg.name)) {
        return this.networks.find(n => n.name == arg.name);
      }
    }
  
    if (key) {
      return this.networks.find(network => {
        if (key == 'networkMagic') {
          return BufferUtils.integerFromBuffer(network[key]) == arg;
        } else {
          return network[key] == arg;
        }
      });
    } else {
      return this.networks.find(network => Object.keys(network).some(prop => {
        let _prop = prop as keyof Network;
        if (_prop == 'networkMagic') {
          return BufferUtils.integerFromBuffer(network[_prop]) == arg;
        } else {
          return network[_prop] == arg;
        }
      }));
    }
  }

  public create(network: NetworkParams): Network {
    return new Network(network);
  }
  
  public add(network: Network | NetworkParams): void {
    if (!(network instanceof Network)) {
      network = new Network(network);
    }
    this.networks.push(network);
  }
  
  public remove(network: Networkish | NetworkParams): void {
    if (typeof network !== 'object') {
      network = this.get(network)!;
      if (!network) {
        return;
      }
    }
    for (let i = 0; i < this.networks.length; i++) {
      if (this.networks[i] === network || JSON.stringify(this.networks[i]) == JSON.stringify(network)) {
        this.networks.splice(i, 1);
      }
    }
  }
}

/** @internal */
export const networks = NetworkManager.getInstance();