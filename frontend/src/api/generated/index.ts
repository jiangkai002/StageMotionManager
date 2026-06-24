/** Generate by swagger-axios-codegen */
// @ts-nocheck
/* eslint-disable */

/** Generate by swagger-axios-codegen */
// @ts-nocheck
/* eslint-disable */
import axiosStatic from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface IRequestOptions extends AxiosRequestConfig {
  /**
   * show loading status
   */
  loading?: boolean;
  /**
   * display error message
   */
  showError?: boolean;
  /**
   * indicates whether Authorization credentials are required for the request
   * @default true
   */
  withAuthorization?: boolean;
}

export interface IRequestPromise<T = any> extends Promise<IRequestResponse<T>> {}

export interface IRequestResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
}

export interface IRequestInstance {
  (config: any): IRequestPromise;
  (url: string, config?: any): IRequestPromise;
  request<T = any>(config: any): IRequestPromise<T>;
}

export interface IRequestConfig {
  method?: any;
  headers?: any;
  url?: any;
  data?: any;
  params?: any;
}

// Add options interface
export interface ServiceOptions {
  axios?: IRequestInstance;
  /** only in axios interceptor config*/
  loading: boolean;
  showError: boolean;
}

// Add default options
export const serviceOptions: ServiceOptions = {};

// Instance selector
export function axios(configs: IRequestConfig, resolve: (p: any) => void, reject: (p: any) => void): Promise<any> {
  if (serviceOptions.axios) {
    return serviceOptions.axios
      .request(configs)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  } else {
    throw new Error('please inject yourself instance like axios  ');
  }
}

export function getConfigs(method: string, contentType: string, url: string, options: any): IRequestConfig {
  const configs: IRequestConfig = {
    loading: serviceOptions.loading,
    showError: serviceOptions.showError,
    ...options,
    method,
    url
  };
  configs.headers = {
    ...options.headers,
    'Content-Type': contentType
  };
  return configs;
}

export const basePath = '';

export interface IList<T> extends Array<T> {}
export interface List<T> extends Array<T> {}
export interface IDictionary<TValue> {
  [key: string]: TValue;
}
export interface Dictionary<TValue> extends IDictionary<TValue> {}

export interface IListResult<T> {
  items?: T[];
}

export class ListResultDto<T> implements IListResult<T> {
  items?: T[];
}

export interface IPagedResult<T> extends IListResult<T> {
  totalCount?: number;
  items?: T[];
}

export class PagedResultDto<T = any> implements IPagedResult<T> {
  totalCount?: number;
  items?: T[];
}

// customer definition
// empty

export class ElementsService {
  /**
   * 创建构件
   */
  static createElementApiElementsPost(
    params: {
      /** requestBody */
      body?: StageElement;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/elements';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 查询所有构件
   */
  static getElementsApiElementsGet(
    params: {
      /**  */
      skip?: number;
      /**  */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/elements';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { skip: params['skip'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据 elementId 查询构件
   */
  static getElementApiElementsElementIdGet(
    params: {
      /**  */
      elementId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/elements/{element_id}';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 更新构件
   */
  static updateElementApiElementsElementIdPut(
    params: {
      /**  */
      elementId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/elements/{element_id}';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 删除构件
   */
  static deleteElementApiElementsElementIdDelete(
    params: {
      /**  */
      elementId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/elements/{element_id}';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

export class ModelFilesService {
  /**
   * 上传模型文件记录
   */
  static createModelFileApiModelFilesPost(
    params: {
      /** requestBody */
      body?: ModelFile;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/model-files';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 查询所有模型文件
   */
  static getModelFilesApiModelFilesGet(
    params: {
      /**  */
      skip?: number;
      /**  */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/model-files';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { skip: params['skip'], limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 批量上传模型文件记录
   */
  static createModelFilesApiModelFilesBatchPost(
    params: {
      /** requestBody */
      body?: ModelFile[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/model-files/batch';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据 ID 查询模型文件
   */
  static getModelFileApiModelFilesFileIdGet(
    params: {
      /**  */
      fileId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/model-files/{file_id}';
      url = url.replace('{file_id}', params['fileId'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 更新模型文件
   */
  static updateModelFileApiModelFilesFileIdPut(
    params: {
      /**  */
      fileId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/model-files/{file_id}';
      url = url.replace('{file_id}', params['fileId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 删除模型文件
   */
  static deleteModelFileApiModelFilesFileIdDelete(
    params: {
      /**  */
      fileId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/model-files/{file_id}';
      url = url.replace('{file_id}', params['fileId'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /**  */
  detail?: ValidationError[];
}

/** 舞台模型文件 */
export interface ModelFile {
  /** 文件名称 */
  name: string;

  /** 模型格式 */
  file_type: ModelFileType;

  /** 模型类型 */
  type: string;

  /** 属于哪个厅 */
  room: string;

  /** 文件存储路径 */
  file_path: string;

  /** 文件大小(字节) */
  file_size?: any | null;

  /** 文件描述 */
  description?: any | null;

  /** 创建时间 */
  created_at?: Date;

  /** 更新时间 */
  updated_at?: Date;
}

/** MotionRange */
export interface MotionRange {
  /** 运动类型 */
  motion_type: MotionType;

  /** 最小范围 */
  min: number;

  /** 最大范围 */
  max: number;

  /** 单位，平移默认mm，旋转默认度 */
  unit?: string;
}

/** StageElement */
export interface StageElement {
  /** 构件名称 */
  name: string;

  /** 构件Id */
  elementId: number;

  /**  */
  guid?: string;

  /** 尺寸 */
  size?: string;

  /** 速度 */
  speed?: number;

  /** 关联的模型文件ID */
  model_file_id: string;

  /** 构件可运动方位及范围 */
  motion_ranges?: MotionRange[];
}

/** ValidationError */
export interface ValidationError {
  /**  */
  loc: any | null[];

  /**  */
  msg: string;

  /**  */
  type: string;

  /**  */
  input?: any | null;

  /**  */
  ctx?: object;
}

export enum ModelFileType {
  'revit' = 'revit',
  'rhino' = 'rhino',
  'sketchup' = 'sketchup',
  'ifc' = 'ifc',
  'gltf' = 'gltf',
  'other' = 'other'
}

export enum MotionType {
  'translation_x' = 'translation_x',
  'translation_y' = 'translation_y',
  'translation_z' = 'translation_z',
  'rotation_x' = 'rotation_x',
  'rotation_y' = 'rotation_y',
  'rotation_z' = 'rotation_z'
}
