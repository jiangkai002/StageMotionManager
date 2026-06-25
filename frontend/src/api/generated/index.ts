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
      /** requestBody */
      body?: StageElementUpdate;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/elements/{element_id}';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

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
      /** requestBody */
      body?: ModelFileUpdate;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/model-files/{file_id}';
      url = url.replace('{file_id}', params['fileId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

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

export class ElementBasicInfoService {
  /**
   * 创建构件基础信息
   */
  static createBasicInfoApiElementBasicInfoPost(
    params: {
      /** requestBody */
      body?: ElementBasicInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 查询所有构件基础信息
   */
  static getBasicInfosApiElementBasicInfoGet(
    params: {
      /**  */
      skip?: number;
      /**  */
      limit?: number;
      /** 按类型筛选 */
      type?: ElementType;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { skip: params['skip'], limit: params['limit'], type: params['type'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 批量创建构件基础信息
   */
  static createBasicInfosApiElementBasicInfoBatchPost(
    params: {
      /** requestBody */
      body?: ElementBasicInfo[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info/batch';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 获取所有构件类型
   */
  static getTypesApiElementBasicInfoTypesGet(options: IRequestOptions = {}): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info/types';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据 elementId 查询
   */
  static getBasicInfoApiElementBasicInfoElementIdGet(
    params: {
      /**  */
      elementId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info/{element_id}';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 更新构件基础信息
   */
  static updateBasicInfoApiElementBasicInfoElementIdPut(
    params: {
      /**  */
      elementId: number;
      /** requestBody */
      body?: ElementBasicInfoUpdate;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info/{element_id}';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 删除构件基础信息
   */
  static deleteBasicInfoApiElementBasicInfoElementIdDelete(
    params: {
      /**  */
      elementId: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info/{element_id}';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 追加关联文档
   */
  static addRelatedDocumentApiElementBasicInfoElementIdDocumentsPost(
    params: {
      /**  */
      elementId: number;
      /** requestBody */
      body?: RelatedDocument;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info/{element_id}/documents';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 移除关联文档
   */
  static removeRelatedDocumentApiElementBasicInfoElementIdDocumentsDelete(
    params: {
      /**  */
      elementId: number;
      /**  */
      ossPath: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/element-basic-info/{element_id}/documents';
      url = url.replace('{element_id}', params['elementId'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);
      configs.params = { oss_path: params['ossPath'] };

      axios(configs, resolve, reject);
    });
  }
}

export class OperationMethodService {
  /**
   * 创建操作方法
   */
  static createOperationMethodApiOperationMethodPost(
    params: {
      /** requestBody */
      body?: OperationMethod;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 查询所有操作方法
   */
  static getOperationMethodsApiOperationMethodGet(
    params: {
      /**  */
      skip?: number;
      /**  */
      limit?: number;
      /** 按构件类型筛选 */
      type?: ElementType;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { skip: params['skip'], limit: params['limit'], type: params['type'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 批量创建
   */
  static createOperationMethodsApiOperationMethodBatchPost(
    params: {
      /** requestBody */
      body?: OperationMethod[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method/batch';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 获取所有操作类型
   */
  static getOperationTypesApiOperationMethodTypesGet(options: IRequestOptions = {}): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method/types';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据构件类型查询
   */
  static getOperationMethodApiOperationMethodTypeGet(
    params: {
      /**  */
      type: ElementType;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method/{type}';
      url = url.replace('{type}', params['type'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 更新操作方法
   */
  static updateOperationMethodApiOperationMethodTypePut(
    params: {
      /**  */
      type: ElementType;
      /** requestBody */
      body?: OperationMethodUpdate;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method/{type}';
      url = url.replace('{type}', params['type'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 删除操作方法
   */
  static deleteOperationMethodApiOperationMethodTypeDelete(
    params: {
      /**  */
      type: ElementType;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method/{type}';
      url = url.replace('{type}', params['type'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 追加操作步骤
   */
  static addOperationStepApiOperationMethodTypeStepsPost(
    params: {
      /**  */
      type: ElementType;
      /** requestBody */
      body?: OperationStep;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method/{type}/steps';
      url = url.replace('{type}', params['type'] + '');

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 移除操作步骤
   */
  static removeOperationStepApiOperationMethodTypeStepsDelete(
    params: {
      /**  */
      type: ElementType;
      /** 操作步骤序号 */
      index: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/operation-method/{type}/steps';
      url = url.replace('{type}', params['type'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);
      configs.params = { index: params['index'] };

      axios(configs, resolve, reject);
    });
  }
}

export class ScenesService {
  /**
   * 创建场景
   */
  static createSceneApiScenesPost(
    params: {
      /** requestBody */
      body?: Scene;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/scenes';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 查询所有场景
   */
  static getScenesApiScenesGet(
    params: {
      /**  */
      skip?: number;
      /**  */
      limit?: number;
      /** 按名称模糊筛选 */
      name?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/scenes';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { skip: params['skip'], limit: params['limit'], name: params['name'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 批量创建场景
   */
  static createScenesApiScenesBatchPost(
    params: {
      /** requestBody */
      body?: Scene[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/scenes/batch';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据 ID 查询场景
   */
  static getSceneApiScenesDocIdGet(
    params: {
      /**  */
      docId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/scenes/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 更新场景
   */
  static updateSceneApiScenesDocIdPut(
    params: {
      /**  */
      docId: string;
      /** requestBody */
      body?: SceneUpdate;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/scenes/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 删除场景
   */
  static deleteSceneApiScenesDocIdDelete(
    params: {
      /**  */
      docId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/scenes/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 追加设备项
   */
  static addDeviceApiScenesDocIdDevicesPost(
    params: {
      /**  */
      docId: string;
      /** requestBody */
      body?: SceneDeviceItem;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/scenes/{doc_id}/devices';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 移除设备项
   */
  static removeDeviceApiScenesDocIdDevicesDelete(
    params: {
      /**  */
      docId: string;
      /** 设备ID */
      deviceId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/scenes/{doc_id}/devices';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);
      configs.params = { device_id: params['deviceId'] };

      axios(configs, resolve, reject);
    });
  }
}

export class MotionTasksService {
  /**
   * 创建运动任务
   */
  static createTaskApiMotionTasksPost(
    params: {
      /** requestBody */
      body?: MotionTask;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 查询所有运动任务
   */
  static getTasksApiMotionTasksGet(
    params: {
      /**  */
      skip?: number;
      /**  */
      limit?: number;
      /** 按状态筛选 */
      status?: TaskStatus;
      /** 按设备ID筛选 */
      deviceId?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        skip: params['skip'],
        limit: params['limit'],
        status: params['status'],
        device_id: params['deviceId']
      };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 批量创建运动任务
   */
  static createTasksApiMotionTasksBatchPost(
    params: {
      /** requestBody */
      body?: MotionTask[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks/batch';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 获取待执行任务
   */
  static getPendingTasksApiMotionTasksPendingGet(
    params: {
      /**  */
      limit?: number;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks/pending';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { limit: params['limit'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 获取所有任务状态
   */
  static getStatusesApiMotionTasksStatusesGet(options: IRequestOptions = {}): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks/statuses';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据 ID 查询任务
   */
  static getTaskApiMotionTasksDocIdGet(
    params: {
      /**  */
      docId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 更新任务
   */
  static updateTaskApiMotionTasksDocIdPut(
    params: {
      /**  */
      docId: string;
      /** requestBody */
      body?: MotionTaskUpdate;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 删除任务
   */
  static deleteTaskApiMotionTasksDocIdDelete(
    params: {
      /**  */
      docId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 更新任务状态
   */
  static updateTaskStatusApiMotionTasksDocIdStatusPut(
    params: {
      /**  */
      docId: string;
      /** 新状态 */
      status: TaskStatus;
      /** 错误信息，失败时填写 */
      errorMessage?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks/{doc_id}/status';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);
      configs.params = { status: params['status'], error_message: params['errorMessage'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 按状态批量删除任务
   */
  static deleteTasksByStatusApiMotionTasksByStatusStatusDelete(
    params: {
      /**  */
      status: TaskStatus;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/motion-tasks/by-status/{status}';
      url = url.replace('{status}', params['status'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

export class MaintenanceRequirementsService {
  /**
   * 创建维保需求
   */
  static createRequirementApiMaintenanceRequirementsPost(
    params: {
      /** requestBody */
      body?: MaintenanceRequirement;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/maintenance-requirements';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 查询所有维保需求
   */
  static getRequirementsApiMaintenanceRequirementsGet(
    params: {
      /**  */
      skip?: number;
      /**  */
      limit?: number;
      /** 按名称模糊筛选 */
      name?: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/maintenance-requirements';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { skip: params['skip'], limit: params['limit'], name: params['name'] };

      axios(configs, resolve, reject);
    });
  }
  /**
   * 批量创建
   */
  static createRequirementsApiMaintenanceRequirementsBatchPost(
    params: {
      /** requestBody */
      body?: MaintenanceRequirement[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/maintenance-requirements/batch';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 获取所有维保周期单位
   */
  static getPeriodsApiMaintenanceRequirementsPeriodsGet(options: IRequestOptions = {}): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/maintenance-requirements/periods';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据 ID 查询维保需求
   */
  static getRequirementApiMaintenanceRequirementsDocIdGet(
    params: {
      /**  */
      docId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/maintenance-requirements/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
  /**
   * 更新维保需求
   */
  static updateRequirementApiMaintenanceRequirementsDocIdPut(
    params: {
      /**  */
      docId: string;
      /** requestBody */
      body?: MaintenanceRequirementUpdate;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/maintenance-requirements/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('put', 'application/json', url, options);

      let data = params.body;

      configs.data = data;

      axios(configs, resolve, reject);
    });
  }
  /**
   * 删除维保需求
   */
  static deleteRequirementApiMaintenanceRequirementsDocIdDelete(
    params: {
      /**  */
      docId: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any | null> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/api/maintenance-requirements/{doc_id}';
      url = url.replace('{doc_id}', params['docId'] + '');

      const configs: IRequestConfig = getConfigs('delete', 'application/json', url, options);

      axios(configs, resolve, reject);
    });
  }
}

/** 构件基础信息 */
export interface ElementBasicInfo {
  /** 构件名称 */
  name: string;

  /**  */
  type: ElementType;

  /** 规格 */
  specification?: string;

  /** 供应商 */
  supplier?: string;

  /** 额定荷载 */
  rated_load?: string;

  /** 驱动方式 */
  drive_method?: string;

  /** 功能说明 */
  function_description?: string;

  /** 关联文档(OSS上传的PDF) */
  related_documents?: RelatedDocument[];

  /** 创建时间 */
  created_at?: Date;

  /** 更新时间 */
  updated_at?: Date;
}

/** 更新构件基础信息 */
export interface ElementBasicInfoUpdate {
  /** 构件名称 */
  name?: string;

  /** 构件类型 */
  type?: ElementType;

  /** 规格 */
  specification?: string;

  /** 供应商 */
  supplier?: string;

  /** 额定荷载 */
  rated_load?: string;

  /** 驱动方式 */
  drive_method?: string;

  /** 功能说明 */
  function_description?: string;

  /** 关联文档 */
  related_documents?: RelatedDocument[];
}

/** 维保频率 */
export interface Frequency {
  /** 次数 */
  times?: number;

  /** 周期单位 */
  period?: MaintenancePeriod;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /**  */
  detail?: ValidationError[];
}

/** 维保需求 */
export interface MaintenanceRequirement {
  /** 维保名称 */
  name: string;

  /** 维保内容 */
  content: string;

  /**  */
  frequency: Frequency;

  /** 教学视频地址 */
  video_url?: string;

  /** 创建时间 */
  created_at?: Date;

  /** 更新时间 */
  updated_at?: Date;
}

/** 更新维保需求 */
export interface MaintenanceRequirementUpdate {
  /** 维保名称 */
  name?: string;

  /** 维保内容 */
  content?: string;

  /** 维保频率 */
  frequency?: Frequency;

  /** 教学视频地址 */
  video_url?: string;
}

/** 舞台模型文件 */
export interface ModelFile {
  /** 文件名称 */
  name: string;

  /** 模型格式 */
  file_type: ModelFileType;

  /** 模型类型 */
  type: string;

  /** 所属厅 */
  room: string;

  /** 文件存储路径 */
  file_path: string;

  /** 文件大小(字节) */
  file_size?: number;

  /** 文件描述 */
  description?: string;

  /** 创建时间 */
  created_at?: Date;

  /** 更新时间 */
  updated_at?: Date;
}

/** 更新模型文件 */
export interface ModelFileUpdate {
  /** 文件名称 */
  name?: string;

  /** 模型格式 */
  file_type?: ModelFileType;

  /** 模型类型 */
  type?: string;

  /** 所属厅 */
  room?: string;

  /** 文件存储路径 */
  file_path?: string;

  /** 文件大小(字节) */
  file_size?: number;

  /** 文件描述 */
  description?: string;
}

/** MotionRange */
export interface MotionRange {
  /** 运动类型 */
  motion_type: MotionType;

  /** 最小范围 */
  min: number;

  /** 最大范围 */
  max: number;

  /** 单位，平移默认 mm，旋转默认度 */
  unit?: string;
}

/** 运动任务模型 */
export interface MotionTask {
  /** 设备ID */
  device_id: string;

  /** 关联场景ID */
  scene_id?: string;

  /** 目标位置(mm) */
  target_position: number;

  /** 运动速度(mm\/s) */
  speed?: number;

  /**  */
  status?: TaskStatus;

  /** 优先级，数字越大优先级越高 */
  priority?: number;

  /** 错误信息 */
  error_message?: string;

  /** 开始执行时间 */
  started_at?: Date;

  /** 完成时间 */
  completed_at?: Date;

  /** 创建时间 */
  created_at?: Date;
}

/** 更新运动任务 */
export interface MotionTaskUpdate {
  /** 设备ID */
  device_id?: string;

  /** 关联场景ID */
  scene_id?: string;

  /** 目标位置(mm) */
  target_position?: number;

  /** 运动速度(mm\/s) */
  speed?: number;

  /** 任务状态 */
  status?: TaskStatus;

  /** 优先级 */
  priority?: number;

  /** 错误信息 */
  error_message?: string;

  /** 开始执行时间 */
  started_at?: Date;

  /** 完成时间 */
  completed_at?: Date;
}

/** OperationMethod */
export interface OperationMethod {
  /** 构件类别 */
  type: ElementType;

  /** 操作步骤列表 */
  operation_steps?: OperationStep[];

  /** 创建时间 */
  created_at?: Date;

  /** 更新时间 */
  updated_at?: Date;
}

/** OperationMethodUpdate */
export interface OperationMethodUpdate {
  /** 鏋勪欢绫诲埆 */
  type?: ElementType;

  /** 鎿嶄綔姝ラ鍒楄〃 */
  operation_steps?: OperationStep[];
}

/** OperationStep */
export interface OperationStep {
  /** 操作顺序 */
  index: number;

  /** 操作名称 */
  step_name: string;

  /** 具体操作细节 */
  operation_detail?: string;

  /** 操作类型 */
  operation_type: OperationType;
}

/** 关联文档，通常是 OSS 上传的 PDF */
export interface RelatedDocument {
  /** 文档名称 */
  name: string;

  /** OSS 存储路径 */
  oss_path: string;

  /** 文件大小(字节) */
  file_size?: number;

  /** 上传时间 */
  uploaded_at?: Date;
}

/** 场景预设模型 */
export interface Scene {
  /** 场景名称 */
  name: string;

  /** 场景描述 */
  description?: string;

  /** 设备目标列表 */
  devices?: SceneDeviceItem[];

  /** 预计执行时长(s) */
  duration?: number;

  /** 创建时间 */
  created_at?: Date;

  /** 更新时间 */
  updated_at?: Date;
}

/** 场景中的设备项 */
export interface SceneDeviceItem {
  /** 设备ID */
  device_id: string;

  /** 目标位置(mm) */
  target_position: number;

  /** 运动速度(mm\/s) */
  speed?: number;
}

/** 更新场景预设 */
export interface SceneUpdate {
  /** 场景名称 */
  name?: string;

  /** 场景描述 */
  description?: string;

  /** 设备目标列表 */
  devices?: SceneDeviceItem[];

  /** 预计执行时长(s) */
  duration?: number;
}

/** 舞台构件 */
export interface StageElement {
  /** 构件名称 */
  name: string;

  /** 构件Id */
  elementId: number;

  /** 唯一标识 */
  guid?: string;

  /** 编号 */
  code?: string;

  /** 尺寸 */
  size?: string;

  /** 速度 */
  speed?: number;

  /** 关联的模型文件ID */
  model_file_id: string;

  /** 关联的构件基础信息ID */
  basic_info_id?: string;

  /** 构件可运动方位及范围 */
  motion_ranges?: MotionRange[];
}

/** 更新舞台构件 */
export interface StageElementUpdate {
  /** 构件名称 */
  name?: string;

  /** 构件Id */
  elementId?: number;

  /** 唯一标识 */
  guid?: string;

  /** 编号 */
  code?: string;

  /** 尺寸 */
  size?: string;

  /** 速度 */
  speed?: number;

  /** 关联的模型文件ID */
  model_file_id?: string;

  /** 关联的构件基础信息ID */
  basic_info_id?: string;

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

export enum ElementType {
  '舞台升降机' = '舞台升降机',
  '车台系统' = '车台系统',
  '车台驱动系统' = '车台驱动系统',
  '过渡升降机 - 侧舞台' = '过渡升降机 - 侧舞台',
  '过渡升降机 - 后舞台' = '过渡升降机 - 后舞台',
  '过渡升降机 - 上舞台右侧' = '过渡升降机 - 上舞台右侧',
  '过渡升降机 - 上舞台左侧' = '过渡升降机 - 上舞台左侧',
  '演员升降小车' = '演员升降小车',
  '后舞台转台车台' = '后舞台转台车台',
  '芭蕾车台（含填充车台）' = '芭蕾车台（含填充车台）',
  '演出平台系统' = '演出平台系统',
  '乐池升降机' = '乐池升降机',
  '乐池护栏' = '乐池护栏',
  '乐池座椅车台' = '乐池座椅车台',
  '乐池保护网' = '乐池保护网',
  '侧舞台补偿升降机' = '侧舞台补偿升降机',
  '后舞台补偿升降机' = '后舞台补偿升降机',
  '台口安全幕' = '台口安全幕',
  '大幕吊杆 / 大幕机' = '大幕吊杆 / 大幕机',
  '活动灯光桥系统' = '活动灯光桥系统',
  '活动灯光架' = '活动灯光架',
  '电动吊杆' = '电动吊杆',
  '活动灯光渡桥' = '活动灯光渡桥',
  '卷线器' = '卷线器',
  '单点吊机系统' = '单点吊机系统',
  '侧光梁' = '侧光梁',
  '链式吊机系统' = '链式吊机系统',
  '芭蕾车台吊机' = '芭蕾车台吊机',
  '固定和活动幕布轨道' = '固定和活动幕布轨道',
  '舞台前部桁架系统' = '舞台前部桁架系统',
  '舞台前部链式吊机' = '舞台前部链式吊机',
  '扬声器组吊机' = '扬声器组吊机',
  '字幕屏吊机' = '字幕屏吊机',
  '横跨舞台链式吊机系统 - 辅助舞台' = '横跨舞台链式吊机系统 - 辅助舞台',
  '后舞台门' = '后舞台门',
  '侧舞台门' = '侧舞台门',
  '上舞台左隔声门' = '上舞台左隔声门',
  '上舞台右隔声门' = '上舞台右隔声门',
  '卸货区门' = '卸货区门',
  '后舞台通道门' = '后舞台通道门',
  '后舞台通道门 - 右侧' = '后舞台通道门 - 右侧',
  '后舞台通道门 - 左侧' = '后舞台通道门 - 左侧',
  '后舞台电动吊杆' = '后舞台电动吊杆',
  '演出控制系统' = '演出控制系统',
  '乐池升降机控制系统' = '乐池升降机控制系统',
  '链式吊机控制系统' = '链式吊机控制系统',
  '侧舞台链式吊机控制系统' = '侧舞台链式吊机控制系统',
  '后舞台吊机控制系统' = '后舞台吊机控制系统',
  '反声罩' = '反声罩',
  '调音台升降机' = '调音台升降机',
  '调音台升降机车台' = '调音台升降机车台',
  '幕布和遮盖物' = '幕布和遮盖物',
  '接入和处理设备' = '接入和处理设备',
  '悬吊附件' = '悬吊附件',
  '备件' = '备件',
  '舞台地板' = '舞台地板',
  '观众厅可变声学' = '观众厅可变声学',
  '排练厅吊杆系统' = '排练厅吊杆系统',
  '活动坐席单元' = '活动坐席单元',
  '安装次级布线' = '安装次级布线',
  '运输升降机' = '运输升降机',
  '座椅提升升降机' = '座椅提升升降机',
  '座椅车台系统' = '座椅车台系统',
  '可移动楼座单元' = '可移动楼座单元',
  '横向链式吊机系统' = '横向链式吊机系统',
  '桁架系统' = '桁架系统',
  '轨道梁' = '轨道梁',
  '台下设备控制系统' = '台下设备控制系统',
  '台上设备控制式系统' = '台上设备控制式系统',
  '观众厅吸声幕' = '观众厅吸声幕',
  '观众厅吸声板' = '观众厅吸声板'
}

export enum MaintenancePeriod {
  '天' = '天',
  '周' = '周',
  '月' = '月',
  '年' = '年'
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

export enum OperationType {
  '常规操作' = '常规操作',
  '紧急停止' = '紧急停止',
  '主备切换' = '主备切换'
}

export enum TaskStatus {
  'pending' = 'pending',
  'running' = 'running',
  'completed' = 'completed',
  'failed' = 'failed',
  'cancelled' = 'cancelled'
}
