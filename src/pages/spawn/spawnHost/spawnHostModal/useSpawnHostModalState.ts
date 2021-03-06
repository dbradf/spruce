import { useReducer } from "react";
import { ExpirationDateType } from "components/Spawn/ExpirationField";
import { PublicKeyInput } from "gql/generated/types";
import { VolumesData } from "../fields";
import { publicKeyStateType } from "./PublicKeyForm";

interface spawnHostState {
  publicKey: PublicKeyInput;
  savePublicKey: boolean;
  userDataScript?: string;
  setupScript?: string;
  noExpiration: boolean;
  expiration: Date;
  volumeId: string;
  homeVolumeSize: number;
  isVirtualWorkStation: boolean;
  distroId: string;
  region: string;
  taskId?: string;
  useProjectSetupScript: boolean;
  spawnHostsStartedByTask?: boolean;
}

export const useSpawnHostModalState = () => ({
  reducer: useReducer(reducer, undefined, init),
  defaultSpawnHostState: init(),
});

const init = () => ({
  userDataScript: null,
  expiration: null,
  noExpiration: false,
  volumeId: null,
  isVirtualWorkStation: false,
  homeVolumeSize: null,
  publicKey: {
    name: "",
    key: "",
  },
  savePublicKey: false,
  distroId: "",
  region: "",
  taskId: null,
  useProjectSetupScript: false,
  spawnHostsStartedByTask: null,
});

const reducer = (state: spawnHostState, action: Action) => {
  switch (action.type) {
    case "reset":
      return init();
    case "editExpiration":
      return {
        ...state,
        noExpiration: action.noExpiration,
        expiration: action.expiration,
      };
    case "editAWSRegion":
      return {
        ...state,
        region: action.region,
      };
    case "editDistro": {
      const { isVirtualWorkstation } = action;
      return {
        ...state,
        distroId: action.distroId,
        isVirtualWorkStation: isVirtualWorkstation,
        homeVolumeSize: isVirtualWorkstation ? 500 : null,
        noExpiration: isVirtualWorkstation,
      };
    }
    case "editPublicKey":
      return {
        ...state,
        publicKey: action.publicKey,
        savePublicKey: action.savePublicKey,
      };
    case "editUserDataScript":
      return {
        ...state,
        userDataScript: action.userDataScript,
      };
    case "editSetupScript":
      return {
        ...state,
        setUpScript: action.setUpScript,
      };
    case "setProjectSetupScript":
      return {
        ...state,
        taskId: action.taskId,
        useProjectSetupScript: action.useProjectSetupScript,
        distroId:
          action.distroId !== undefined ? action.distroId : state.distroId,
      };
    case "setSpawnHostsStartedByTask":
      return {
        ...state,
        spawnHostsStartedByTask: action.spawnHostsStartedByTask,
      };
    case "editVolumes":
      return {
        ...state,
        volumeId: action.volumeId,
        homeVolumeSize: action.homeVolumeSize,
      };
    default:
      throw new Error();
  }
};

export type Action =
  | { type: "reset" }
  | { type: "editDistro"; distroId: string; isVirtualWorkstation?: boolean }
  | { type: "editAWSRegion"; region: string }
  | { type: "editUserDataScript"; userDataScript: string }
  | { type: "editSetupScript"; setUpScript: string }
  | {
      type: "setProjectSetupScript";
      taskId: string;
      useProjectSetupScript: boolean;
      distroId?: string;
    }
  | {
      type: "setSpawnHostsStartedByTask";
      spawnHostsStartedByTask: boolean;
    }
  | ({ type: "editPublicKey" } & publicKeyStateType)
  | ({ type: "editExpiration" } & ExpirationDateType)
  | ({ type: "editVolumes" } & VolumesData);
