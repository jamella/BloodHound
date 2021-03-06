import React, { Component } from 'react';
import { defaultAjaxSettings } from 'utils';

export default class Login extends Component {
	constructor(){
		super();
		this.state = {
			url: "",
			icon: null,
			loginEnabled: false,
			dbHelpVisible: false,
			loginHelpVisible: false,
			user: "",
			password: "",
			loginInProgress: false
		}
	}

	checkDBPresence(){
		var url = this.state.url;
		var icon = this.state.icon;

		if (url === ""){
			return;
		}

		jQuery(this.refs.urlspinner).toggle(true)

		if (!url.startsWith('http://')){
			url = 'http://' + url
		}

		url = url.replace(/\/$/, "");

		icon.removeClass();
		icon.addClass("fa fa-spinner fa-spin form-control-feedback");
		icon.toggle(true);

		$.ajax({
			url: url,
			type: 'GET',
			success: function(e){
				if (e.data.endsWith('/db/data/')){
					icon.removeClass();
					icon.addClass("fa fa-check-circle green-icon-color form-control-feedback");
				}else{
					this.setState({dbHelpVisible: true})
					icon.removeClass();
                    icon.addClass("fa fa-times-circle red-icon-color form-control-feedback");
				}

				this.setState({loginEnabled: true, url: url})
			}.bind(this),
			error: function(e){
				icon.removeClass();
                icon.addClass("fa fa-times-circle red-icon-color form-control-feedback");
              	this.setState({loginEnabled: false, dbHelpVisible: true})  
			}.bind(this)
		})
	}

	checkDBCreds(){
		if (this.state.loginInProgress){
			return;
		}
		this.setState({
			loginInProgress: true,
			loginHelpVisible: false,
			loginEnabled: false
		})

		var header = "Basic " + btoa(this.state.user + ":" + this.state.password)
		var btn = jQuery(this.refs.loginButton)

		btn.toggleClass('activate');

		$.ajax({
			url: this.state.url + '/db/data/',
			type: 'GET',
			headers: {
				Authorization: header
			},
			success: function(e){
				btn.toggleClass('activate');
				btn.removeClass('btn-default')
				btn.addClass('btn-success')
				btn.html('Success!')
				this.setState({
					loginInProgress: false
				})
				conf.set('databaseInfo',{
					url: this.state.url,
					user: this.state.user,
					password: this.state.password
				})

				appStore.databaseInfo = conf.get('databaseInfo');
				setTimeout(function(){
					jQuery(this.refs.outer).fadeOut(400, function(){
						renderEmit.emit('login');
					});
				}.bind(this), 1500)
			}.bind(this),
			error: function(e){
				btn.toggleClass('activate');
				this.setState({
					loginHelpVisible: true,
					loginInProgress: false,
					loginEnabled: true
				})
			}.bind(this)
		})
	}

	componentWillMount() {
		var c = conf.get('databaseInfo')
		if (typeof c !== 'undefined'){
			this.setState({
				url: c.url,
				user: c.user,
				password: c.password
			})
		}
	}

	componentDidMount() {
		jQuery(this.refs.urlspinner).toggle(false)
		this.setState({icon: jQuery(this.refs.urlspinner)})
		if (this.state.password !== ""){
			this.checkDBCreds();
		}
	}

	_urlChanged(event){
		this.setState({url: event.target.value})
	}

	_userChanged(event){
		this.setState({user: event.target.value})	
	}

	_passChanged(event){
		this.setState({password: event.target.value})	
	}

	_triggerLogin(e){
		var key = e.keyCode ? e.keyCode : e.which

		if (key === 13){
			this.checkDBCreds()
		}
	}

	render() {
		return (
			<div className="loginwindow">
				<div id="loginpanel" ref="outer">
					<img src="src/img/logo-white-transparent-full.png" />
					<div className="text-center">
						<span>Log in to Neo4j Database</span>
					</div>
					<form>
						<div className="form-group has-feedback">
							<div className="input-group">
								<span className="input-group-addon" id="dburladdon">
									Database URL
								</span>
								<input ref="url" onFocus={function(){this.setState({dbHelpVisible: false})}.bind(this)} onBlur={this.checkDBPresence.bind(this)} onChange={this._urlChanged.bind(this)} type="text" className="form-control" value={this.state.url} placeholder="http://db-ip:dp-port" aria-describedby="dburladdon" />
								<i ref="urlspinner" className="fa fa-spinner fa-spin form-control-feedback" />
							</div>
							{this.state.dbHelpVisible ? <p className="help-block help-block-add">No Neo4j REST API Found</p> : null}
							<div className="input-group spacing">
								<span className="input-group-addon" id="dbuseraddon">DB Username</span>
								<input ref="user" type="text" value={this.state.user} onKeyUp={this._triggerLogin.bind(this)} onChange={this._userChanged.bind(this)} className="form-control" placeholder="neo4j" aria-describedby="dbuseraddon" />
							</div>
							<div className="input-group spacing">
								<span className="input-group-addon" id="dbpwaddon">DB Password</span>
								<input ref="password" value={this.state.password} onKeyDown={this._triggerLogin.bind(this)} onChange={this._passChanged.bind(this)} type="password" className="form-control" placeholder="neo4j" aria-describedby="dbpwaddon" />
							</div>
							{this.state.loginHelpVisible ? <p className="help-block help-block-add" style={{color: "#d9534f"}}>Wrong username or password</p> : null}
							<button ref="loginButton" disabled={!this.state.loginEnabled} type="button" onClick={this.checkDBCreds.bind(this)} className="btn btn-primary loginbutton has-spinner">
								Login
								<span className="button-spinner">
									<i className="fa fa-spinner fa-spin" />
								</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	}
}
