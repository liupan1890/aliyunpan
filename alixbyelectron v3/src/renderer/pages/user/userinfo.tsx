import { Avatar, Button, Col, Divider, List, message, Row, Switch } from 'antd'
import React from 'react'
import { ModalProvider } from 'react-use-modal'
import { connect, UserModelState } from 'umi'
import UserDAL from '../../store/userdal'
import UserLoginModal from './userlogin'

const UserInfo = ({ dispatch, user }: { dispatch: any; user: UserModelState }) => {
  function handleUserChange(userID: string) {
    UserDAL.UserChange(userID)
  }

  function handleRefreshUserInfo() {
    const userID = UserDAL.QueryUserID()
    UserDAL.UserRefreshByUserFace(userID, true).then(() => {
      message.info('刷新用户信息成功')
    })
  }

  function handleLogOff() {
    const userID = UserDAL.QueryUserID()
    UserDAL.UserLogOff(userID)
  }

  const { userID, userLogined } = user
  const userList = UserDAL.GetUserList()

  if (userLogined) {
    const userToken = UserDAL.GetUserToken(userID)!

    return (
      <div style={{ width: '250px' }}>
        <Row align="middle">
          <Col flex="60px">
            <Avatar size={56} src={<img src={userToken.avatar} />} />
          </Col>
          <Col flex="auto">
            <span className="username">Hi {userToken.nick_name ? userToken.nick_name : userToken.user_name}</span>
            <br />
            <span style={{ marginTop: '4px' }}>{userToken.spaceinfo}</span>
          </Col>
          <Col flex="none">
            <Button type="link" title="刷新账号信息" onClick={handleRefreshUserInfo}>
              <i className="iconfont iconsync" />
            </Button>
            <br />
            <Button type="link" title="退出该账号登录状态" onClick={handleLogOff}>
              退出
            </Button>
          </Col>
        </Row>

        <List
          className="userlist"
          style={{ margin: '24px 0' }}
          header={<div className="userspace">切换到其他账号</div>}
          bordered
          dataSource={userList}
          renderItem={(item) => (
            <List.Item>
              <span>{item.nick_name ? item.nick_name : item.user_name}</span>
              <Switch checkedChildren="当前" unCheckedChildren="选我" size="small" checked={userToken.user_id == item.user_id} onChange={() => handleUserChange(item.user_id)} title="切换到这个账号" />
            </List.Item>
          )}
        />

        <Row justify="center" align="top">
          <Col>
            <ModalProvider>
              <UserLoginModal />
            </ModalProvider>
          </Col>
        </Row>
      </div>
    )
  } else {
    return (
      <div style={{ width: '250px' }}>
        <Row align="middle">
          <Col flex="60px">
            <Avatar size={56} src={<img src="userface.png" />} />
          </Col>
          <Col flex="auto">
            <span className="username">Welcome</span>
            <br />
            <span className="userspace">还没登录账号?</span>
          </Col>
        </Row>
        <Divider />
        <Row justify="center" align="top">
          <Col>
            <ModalProvider>
              <UserLoginModal />
            </ModalProvider>
          </Col>
        </Row>
      </div>
    )
  }
}

export default connect(({ user }: { user: UserModelState }) => ({
  user
}))(UserInfo)
