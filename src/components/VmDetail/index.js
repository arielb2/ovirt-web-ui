import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import AppConfiguration from '../../config'

import style from './style.css'
import sharedStyle from '../sharedStyle.css'

import {
  downloadConsole,
  getConsoleOptions,
  saveConsoleOptions,
  getRDP,
} from '../../actions/index'

import { templateNameRenderer } from '../../helpers'

import FieldHelp from '../FieldHelp/index'
import DetailContainer from '../DetailContainer'
import ConsoleOptions from '../ConsoleOptions/index'
import VmDisks from '../VmDisks/index'
import VmsListNavigation from '../VmsListNavigation/index'
import { NextRunLabel, OptimizedForLabel } from './labels'
import LastMessage from './LastMessage'
import VmConsoles from './VmConsoles'

import { userFormatOfBytes, VmIcon, VmStatusIcon } from 'ovirt-ui-components'
import Selectors from '../../selectors'

class VmDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      renderDisks: true,
      openConsoleSettings: false,
      vmsNavigationExpanded: true,
    }

    this.consoleSettings = this.consoleSettings.bind(this)
    this.toggleVmsNavExpansion = this.toggleVmsNavExpansion.bind(this)
  }

  toggleVmsNavExpansion (e) {
    this.setState({
      vmsNavigationExpanded: !this.state.vmsNavigationExpanded,
    })

    e.preventDefault()
  }

  consoleSettings (e) {
    this.props.onConsoleOptionsOpen()
    this.setState({
      openConsoleSettings: !this.state.openConsoleSettings,
    })

    e.preventDefault()
  }

  render () {
    const {
      vm,
      icons,
      userMessages,
      onConsole,
      isPool,
      onConsoleOptionsSave,
      options,
      pool,
      onRDP,
    } = this.props

    const name = isPool ? pool.get('name') : vm.get('name')
    const iconId = vm.getIn(['icons', 'small', 'id'])
    const icon = icons.get(iconId)
    const disks = vm.get('disks')
    const os = Selectors.getOperatingSystemByName(vm.getIn(['os', 'type']))
    const cluster = Selectors.getClusterById(vm.getIn(['cluster', 'id']))
    const template = Selectors.getTemplateById(vm.getIn(['template', 'id']))

    const disksElement = (<VmDisks disks={disks} open={this.state.renderDisks} />)

    let optionsJS = options.hasIn(['options', 'consoleOptions', vm.get('id')]) ? options.getIn(['options', 'consoleOptions', vm.get('id')]).toJS() : {}

    const consoleOptionsShowHide = (
      <small>
        <a href='#' onClick={this.consoleSettings}>
          <i className={`pficon pficon-edit`} />&nbsp;
        </a>
      </small>)

    const hasDisks = disks.size > 0
    const noDisks = hasDisks || (<small>no disks</small>)

    const consolesHelp = (
      <div>
        <p>If the virtual machines is running, click to access it's Graphics Console.</p>
        <p>Please refer to <a href={AppConfiguration.consoleClientResourcesURL} target='_blank'>documentation</a> for more information.</p>
      </div>
    )

    return (
      <div>
        <VmsListNavigation selectedVm={vm} expanded={this.state.vmsNavigationExpanded} toggleExpansion={this.toggleVmsNavExpansion} />

        <div className={this.state.vmsNavigationExpanded ? style['vms-nav-expanded'] : style['vms-nav-collapsed']}>
          <DetailContainer>
            <h1 className={style['header']}>
              <VmIcon icon={icon} missingIconClassName='pficon pficon-virtual-machine' className={sharedStyle['vm-detail-icon']} />
              &nbsp;{name}
            </h1>
            <NextRunLabel vm={vm} />
            <OptimizedForLabel vm={vm} />
            <LastMessage vmId={vm.get('id')} userMessages={userMessages} />
            <div className={style['vm-detail-container']}>
              <dl className={sharedStyle['vm-properties']}>
                <dt>
                  <FieldHelp content='The actual state the virtual machine is in.' text='State' />
                </dt>
                <dd><VmStatusIcon state={vm.get('status')} />&nbsp;{vm.get('status')}
                </dd>

                <dt>
                  <FieldHelp content='Optional user description of the virtual machine.' text='Description' />
                </dt>
                <dd>{vm.get('description')}</dd>

                <dt>
                  <FieldHelp content='Group of hosts the virtual machine can be running on.' text='Cluster' />
                </dt>
                <dd>{cluster ? cluster.get('name') : ''}</dd>

                <dt>
                  <FieldHelp content='Contains the configuration and disks which will be used to create this virtual machine. Please customize as needed.' text='Template' />
                </dt>
                <dd>{template ? templateNameRenderer(template) : ''}</dd>

                <dt>
                  <FieldHelp content='Operating system installed on the virtual machine.' text='Operating System' />
                </dt>
                <dd>{os ? os.get('description') : vm.getIn(['os', 'type'])}</dd>

                <dt><span className='pficon pficon-memory' />&nbsp;
                  <FieldHelp content='Total memory the virtual machine will be equipped with. In megabytes.' text='Defined Memory' />
                </dt>
                <dd>{userFormatOfBytes(vm.getIn(['memory', 'total'])).str}</dd>

                <dt><span className='pficon pficon-cpu' />&nbsp;
                  <FieldHelp content='Total count of virtual processors the virtual machine will be equipped with.' text='CPUs' />
                </dt>
                <dd>{vm.getIn(['cpu', 'vCPUs'])}</dd>

                <dt><span className='pficon pficon-network' />&nbsp;
                  <FieldHelp content='Fully Qualified Domain Name (FQDN) of the virtual machine. Please note, guest agent must be installed within the virtual machine to collect this value.' text='Address' />
                </dt>
                <dd>{vm.get('fqdn')}</dd>
              </dl>

              <dl className={sharedStyle['vm-properties']}>
                <dt><span className='pficon pficon-screen' />
                  &nbsp;
                  <FieldHelp content={consolesHelp} text='Consoles' />
                  &nbsp;
                  {consoleOptionsShowHide}
                </dt>
                <VmConsoles vm={vm} onConsole={onConsole} onRDP={onRDP} />
                <ConsoleOptions options={optionsJS} onSave={onConsoleOptionsSave} open={this.state.openConsoleSettings} />

                <dt><span className='fa fa-database' />
                  &nbsp;
                  <FieldHelp content='Storage connected to the virtual machines.' text='Disks' />
                  &nbsp;
                </dt>
                {noDisks}
                {disksElement}
              </dl>
            </div>
          </DetailContainer>
        </div>
      </div>
    )
  }
}
VmDetail.propTypes = {
  vm: PropTypes.object,
  pool: PropTypes.object,
  icons: PropTypes.object.isRequired,
  userMessages: PropTypes.object.isRequired,
  onConsole: PropTypes.func.isRequired,
  onConsoleOptionsSave: PropTypes.func.isRequired,
  onConsoleOptionsOpen: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
  isPool: PropTypes.bool,
  config: PropTypes.object.isRequired,
  onRDP: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    icons: state.icons,
    userMessages: state.userMessages,
    options: state.options,
  }),

  (dispatch, { vm, config }) => ({
    onConsole: ({ vmId, consoleId }) => dispatch(downloadConsole({ vmId, consoleId })),
    onConsoleOptionsSave: ({ options }) => dispatch(saveConsoleOptions({ vmId: vm.get('id'), options })),
    onConsoleOptionsOpen: () => dispatch(getConsoleOptions({ vmId: vm.get('id') })),
    onRDP: () => dispatch(getRDP({ vmName: vm.get('name'), username: config.getIn([ 'user', 'name' ]), domain: config.get('domain'), fqdn: vm.get('fqdn') })),
  })
)(VmDetail)
