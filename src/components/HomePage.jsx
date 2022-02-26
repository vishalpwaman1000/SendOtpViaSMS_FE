import React, { Component } from 'react'
import './HomePage.scss'
import { TextField, Button } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import ErrorIcon from '@material-ui/icons/Error'
import CrudServices from '../services/CrudServices'
import Pagination from '@material-ui/lab/Pagination'
import MuiAlert from '@material-ui/lab/Alert'
import OtpCountDown from './OtpCountDown'
const crudService = new CrudServices()

const pattern = new RegExp(/^[0-9\b]*$/)

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

export default class HomePage extends Component {
  constructor() {
    super()
    this.state = {
      UserId: 0,
      MobileNumber: '',
      CurrentMobileNumber: '',
      Otp: '',
      Information: [],
      Operation: 'success', //error , success
      OperationMessage: '',
      error: {
        MobileNumber: '',
        Otp: '',
      },

      //Flags
      OpenAlert: false,
      UpdateFlag: false,
      OtpFlag: false,
      ValidMobileNumber: true,
      ValidOtpNumber: true,
      ShowSendOtpButtonFlag: false,
      timerFlag: false,
      defaultFlag: false,

      //Pagination
      RecordPerPage: 2,
      PageNumber: 1,
      currentPage: 1,
      totalRecords: 0,
      totalPages: 0,
    }

    this.ReadInformationMethod = this.ReadInformationMethod.bind(this)
  }

  componentWillMount() {
    //console.log('Component Will Mount')
    this.ReadInformationMethod(this.state.currentPage)
  }

  ReadInformationMethod(CurrentPage) {
    let data = {
      pageNumber: CurrentPage,
      recordPerPage: this.state.RecordPerPage,
    }

    crudService
      .GetMobileOtpDetail(data)
      .then((data) => {
        // console.clear()
        /* console.log(data.data) */
        //console.log(data.data.getMobileOtpDetails)
        this.setState({ totalRecords: data.data.totalRecords })
        this.setState({ totalPages: data.data.totalPages })
        this.setState({ DataRecord: data.data.readRecord })
        this.setState({ Information: data.data.getMobileOtpDetails })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  handleSubmit = () => {
    if (this.state.MobileNumber === '' || !this.state.ValidMobileNumber) {
      console.log('MobileNumber Is Null or not valid format')
      this.setState({ ValidMobileNumber: false })
      return
    } else {
      console.log('MobileNumber Is In valid format')
    }

    this.setState({ timerFlag: true, ShowSendOtpButtonFlag: true })

    // console.log('Send Otp')
    const data = {
      mobileNumber: this.state.MobileNumber,
    }

    crudService
      .SendOTP(data)
      .then((data) => {
        console.log(data.data, 'isSuccess:', data.data.isSuccess)
        this.setState({
          OtpFlag: data.data.isSuccess ? true : false,
          defaultFlag: true,
          OpenAlert: true,
          Operation: 'success',
          OperationMessage: 'Otp Send Successful',
        })

        this.ReadInformationMethod(this.state.PageNumber)
      })
      .catch((error) => {
        console.table('Error : ' + error)
        this.setState({
          otp: false,
          OpenAlert: true,
          Operation: 'error',
          OperationMessage: 'Otp Send Failed',
        })
        this.ReadInformationMethod(this.state.PageNumber)
      })
  }

  handleOtpSubmit = () => {
    if (this.state.Otp.length !== 6 && !this.state.ValidOtpNumber) {
      console.log('Invalid Otp Input')
      this.setState({ ValidOtpNumber: false, OpenAlert: true })
      return
    } else {
      console.log('Valid Otp Number')
    }

    let data = {
      mobileNumber: this.state.MobileNumber,
      otp: this.state.Otp,
    }

    crudService
      .OtpVarification(data)
      .then((data) => {
        console.log(data.data, 'isSuccess:', data.data.isSuccess)
        this.setState({
          OpenAlert: true,
          Operation: 'success',
          OperationMessage: 'Otp Verification Successful',
        })
        this.handleNewOperation()
        this.ReadInformationMethod(this.state.PageNumber)
      })
      .catch((error) => {
        console.table('Error : ' + error)
        this.setState({
          OpenAlert: true,
          Operation: 'error',
          OperationMessage: 'Otp Verification Failed',
        })
        this.ReadInformationMethod(this.state.PageNumber)
      })
  }

  handleNewOperation = () => {
    this.setState({
      UpdateFlag: false,
      OtpFlag: false,
      ValidMobileNumber: true,
      ShowSendOtpButtonFlag: false,
      timerFlag: false,
      defaultFlag: false,
      MobileNumber: '',
      otp: '',
    })
  }

  handleChanges = (e) => {
    const { name, value } = e.target

    switch (name) {
      case 'MobileNumber':
        if (value.length === 10) {
          this.setState({ ValidMobileNumber: true })
        } else {
          if (value.length < 11) {
            this.setState({ ValidMobileNumber: false })
          }
        }

        if (pattern.test(value) && value.length < 11) {
          this.setState({ [name]: value })
        }
        break

      case 'Otp':
        if (value.length === 6) {
          this.setState({ ValidOtpNumber: true })
        } else {
          if (value.length < 7) {
            this.setState({ ValidOtpNumber: false })
          }
        }

        if (pattern.test(value) && value.length < 7) {
          this.setState({ [name]: value })
        }
        break

      default:
        break
    }

    console.log(
      'name : ' + name + ' value : ' + value + ' Length ' + value.length,
    )
  }

  handleEdit = (data) => {
    console.table(data)
    this.setState({
      UserID: data.userID,
      UserName: data.userName,
      Age: data.age,
      UpdateFlag: true,
    })
  }

  handleDelete = (datas) => {
    console.log('handle Delete call', datas.userID)
    const data = {
      userId: datas.userID,
    }
    crudService
      .DeleteInformation(data)
      .then((data) => {
        console.table(data.data)
        this.ReadInformationMethod()
      })
      .catch((error) => {
        console.log(error)
        this.ReadInformationMethod()
      })
  }

  ResetCountDown = () => {
    this.setState({ defaultFlag: false })
    this.setState({ timerFlag: false })
  }

  handlePaging = (event, value) => {
    this.setState({ PageNumber: value })
    console.log('value : ', value)
    this.ReadInformationMethod(value)
  }

  handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    this.setState({ OpenAlert: false })
  }

  render() {
    console.log('State : ', this.state)
    let state = this.state
    return (
      <div className="MainContainer">
        <div className="SubContainer">
          <div className="Box1">
            <div className="Input-Container">
              <div className="Header">SMS OTP VERIFICATION SYSTEM</div>
              {this.state.OtpFlag ? (
                <div className="flex-containt">
                  {state.MobileNumber !== '' && state.ValidMobileNumber ? (
                    <div className="current-Input">
                      Current Mobile Number : {state.MobileNumber}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex-containt"></div>
              )}
              <div className="flex-containt">
                <div className="sub-flex-containt">
                  {!this.state.OtpFlag ? (
                    <TextField
                      error={!state.ValidMobileNumber}
                      autoComplete="off"
                      id="MobileNumber"
                      name="MobileNumber"
                      placeholder="Mobile Number"
                      variant="outlined"
                      size="small"
                      style={{ width: '400px' }}
                      value={state.MobileNumber}
                      onChange={this.handleChanges}
                    />
                  ) : (
                    <TextField
                      error={!state.ValidOtpNumber}
                      autoComplete="off"
                      id="Otp"
                      name="Otp"
                      placeholder="Otp Number"
                      variant="outlined"
                      size="small"
                      style={{ width: '400px' }}
                      value={state.Otp}
                      onChange={this.handleChanges}
                    />
                  )}
                  {!this.state.OtpFlag ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={this.handleSubmit}
                    >
                      Send Otp
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={this.handleOtpSubmit}
                    >
                      Verify Otp
                    </Button>
                  )}
                </div>
                {!this.state.ValidMobileNumber ? (
                  <div className="error">
                    <ErrorIcon className="error-Icon" fontSize="small" />
                    <div className="error-Message">
                      Please Enter Valid Mobile Number
                    </div>
                  </div>
                ) : null}
                {!this.state.ValidOtpNumber ? (
                  <div className="error">
                    <ErrorIcon className="error-Icon" fontSize="small" />
                    <div className="error-Message">
                      Please Enter Valid 6 Digit OTP Number
                    </div>
                  </div>
                ) : null}
              </div>
              {this.state.OtpFlag ? (
                <div className="flex-button">
                  <div className="sub-flex-button">
                    {this.state.timerFlag ? (
                      <div className="sub-flex-button">
                        <OtpCountDown callBack={this.ResetCountDown} />
                      </div>
                    ) : null}
                  </div>
                  <div className="sub-flex-button">
                    {this.state.ShowSendOtpButtonFlag ? (
                      <Button
                        disabled={this.state.defaultFlag}
                        variant="outlined"
                        color="secondary"
                        onClick={this.handleSubmit}
                      >
                        Send Otp Again
                      </Button>
                    ) : null}
                  </div>
                  <div className="sub-flex-button">
                    <Button
                      variant="contained"
                      color="primary"
                      // className="sub-flex-button"
                      onClick={this.handleNewOperation}
                    >
                      New Operation
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-button"></div>
              )}
            </div>
          </div>
          <div className="Box2">
            <div className="data-flex">
              <div className="UserID">UserID</div>
              <div className="MobileNumber">Mobile Number</div>
              <div className="OtpGenerateCount">Total OTP Count</div>
              <div className="Date">Date</div>
            </div>
            {this.state.Information.map(function (data, index) {
              return (
                <div key={index} className="data-flex">
                  <div className="UserID">{data.userID}</div>
                  <div className="MobileNumber">{data.mobileNumber}</div>
                  <div className="OtpGenerateCount">
                    {data.otpGenerateCount}
                  </div>
                  <div className="Date">{data.date}</div>
                </div>
              )
            })}
          </div>
        </div>
        <Snackbar
          open={state.OpenAlert}
          autoHideDuration={6000}
          onClose={this.handleAlertClose}
        >
          <Alert onClose={this.handleAlertClose} severity={state.Operation}>
            {state.OperationMessage}
          </Alert>
        </Snackbar>

        <Pagination
          count={state.totalPages}
          page={this.state.PageNumber}
          onChange={this.handlePaging}
          variant="outlined"
          shape="rounded"
          color="secondary"
        />
      </div>
    )
  }
}
