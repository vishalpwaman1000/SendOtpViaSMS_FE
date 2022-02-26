import Config from '../configuration/Config'
import AxiosServices from './AxiosServices'

const axiosService = new AxiosServices()

export default class CrudServices {
  SendOTP(data) {
    //console.log('SendOTP : ' + Config.SendOTP)
    return axiosService.post(Config.SendOTP, data, false)
  }

  GetMobileOtpDetail(data) {
    //console.log('GetMobileOtpDetail : ' + Config.GetMobileOtpDetail)
    return axiosService.post(Config.GetMobileOtpDetail, data, false)
  }

  OtpVarification(data) {
    console.log('OtpVarification : ' + Config.OtpVarification, 'Data : ', data)
    return axiosService.post(Config.OtpVarification, data, false)
  }
}
