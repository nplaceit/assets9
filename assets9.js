#!/usr/bin/env node
'use strict'

let fs = require('fs')
//let gm = require('gm').subClass({imageMagick: true})
let sharp = require( 'sharp' )
let patch9 = require( './patch9' )
let loop = require( './loop' )

let folder = '.'

let icons = [
	{name:"app_store", size: "1024x1024"},
	{name:"iphone_legacy", size: "57x57"},
	{name:"iphone_legacy_2x", size: "114x114"},
	{name:"iphone_2x", size: "120x120"},
	{name: "iphone_3x", size: "180x180"},
	{name: "ipad", size: "76x76"},
	{name: "ipad_2x", size: "152x152"},
	{name: "ipad_pro", size: "167x167"},
	{name: "ipad_app_legacy", size: "72x72"},
	{name: "ipad_app_legacy_2x", size: "144x144"},
	{name: "ios_settings", size: "29x29"},
	{name: "ios_settings_2x", size: "58x58"},
	{name: "ios_settings_3x", size: "87x87"},
	{name: "ios_spotlight", size: "40x40"},
	{name: "ios_spotlight_2x", size: "80x80"},
	{name: "ios_spotlight_3x", size: "120x120"},
	{name: "ipad_spotlight_legacy", size: "50x50"},
	{name: "ipad_spotlight_legacy_2x", size: "100x100"},
	{name: "ios_notification", size: "20x20"},
	{name: "ios_notification_2x", size: "40x40"},
	{name: "ios_notification_3x", size: "60x60"},
	{name: "android_mdpi", size: "48x48"},
	{name: "android_hdpi", size: "72x72"},
	{name: "android_xhdpi", size: "96x96"},
	{name: "android_xxhdpi", size: "144x144"},
	{name: "android_xxxhdpi", size: "192x192"}
]

let splashes = [
	{name:"iphone_2x",size:"640x960"},
	{name:"iphone5",size:"640x1136"},
	{name:"iphone6",size:"750x1334"},
	{name:"iphone6p_portrait",size:"1242x2208"},
	{name:"iphone6p_landscape",size:"2208x1242"},
	{name:"iphoneX_portrait",size:"1125x2436"},
	{name:"iphoneX_landscape",size:"2436x1125"},
	{name:"ipad_portrait",size:"768x1024"},
	{name:"ipad_portrait_5_6",size:"320x480", meteor:false},
	{name:"ipad_portrait_5_6_2x",size:"640x960", meteor:false},
	{name:"ipad_portrait_5_6_retina",size:"640x1136", meteor:false},
	{name:"ipad_portrait_5_6_wsb",size:"768x1004", meteor:false},
	{name:"ipad_portrait_5_6_wsb_2x",size:"1536x2008", meteor:false},
	{name:"ipad_portrait_2x",size:"1536x2048"},
	{name:"ipad_landscape",size:"1024x768"},
	{name:"ipad_landscape_2x",size:"2048x1536"},
	{name:"ipad_portrait_pro_10_5",size:"1668x2224"},
	{name:"ipad_landscape_pro_10_5",size:"2224x1668"},
	{name:"ipad_portrait_pro_12_9",size:"2048x2732"},
	{name:"ipad_landscape_pro_12_9",size:"2732x2048"},
	{name:"android_mdpi_portrait",size:"320x480"},
	{name:"android_mdpi_landscape",size:"480x320"},
	{name:"android_hdpi_portrait",size:"480x800"},
	{name:"android_hdpi_landscape",size:"800x480"},
	{name:"android_xhdpi_portrait",size:"720x1280"},
	{name:"android_xhdpi_landscape",size:"1280x720"},
	{name:"android_xxhdpi_portrait",size:"960x1600"},
	{name:"android_xxhdpi_landscape",size:"1600x960"},
	{name:"android_xxxhdpi_portrait",size:"1280x1920"},
	{name:"android_xxxhdpi_landscape",size:"1920x1280"}
 ]

function getSize( image ){
	let sizes = image.size.split('x');
	return {
		width: parseInt(sizes[0]),
		height: parseInt(sizes[1])
	}
}

// source file, target directory, image profile
function resize( source , target , image , done ){

	let size = getSize(image)
	let name = image.name
	let filename = target + name + '.png'

	//gm( source ).resize( size.width , size.height ).write( filename , function(error){
	sharp( source ).resize( size.width , size.height ).gamma(3).toFile( filename , function(error){

		if( error ){
			console.log( 'ERROR writing (resize)' , error )

		} else {
			
			done()

		}

	} )

}

function crop( source , target , image , done ){

	let size = getSize(image)
	let name = image.name
	let filename = target + name + '.png'

	// square up so that it cuts off as little as possible
	let span = ( size.height > size.width ? size.height : size.width );

	// calculate x and y offset
	// let xOffset = (span/2) - (size.width/2);
	// let yOffset = (span/2) - (size.height/2);

	//gm( source ).resize( span , span ).crop( size.width , size.height , xOffset , yOffset ).write( filename , function(error){
	sharp( source ).resize( span , span ).embed().resize( size.width , size.height ).crop().toFile( filename , function(error){

		if( error ){
			console.log( 'ERROR writing (crop)' , error )

		} else {

			// create 9 patch png for android
			if( name.indexOf( 'android' ) >= 0 ){
				patch9( filename , function(){

					// delete non 9 patch png
					fs.unlink( filename );
					done()

				} )
			
			} else {
				done()

			}

		}

	})

}


function showMeteorConfig(){

	console.log( 'App.icons({' );
	icons.forEach(function(icon,index) {
		console.log( "\t'" + icon.name + "': '" + folder + "/icons/" + icon.name + ".png'" + (index<icons.length-1?',':'') + " // " + icon.size );
	});
	console.log( '});' );


	console.log( 'App.launchScreens({' );
	splashes.forEach(function(splash,index) {
		if(splash.meteor !== false){
			console.log( "\t'" + splash.name + "': '" + folder + "/splashes/" + splash.name + (splash.name.indexOf('android')>=0?'.9':'') + ".png'" + (index<splashes.length-1?',':'') + " // " + splash.size );
        }
	});
	console.log( '});' );

}



if(!fs.existsSync( folder + '/icons')) {
	fs.mkdirSync( folder + '/icons');
}

if(!fs.existsSync( folder + '/splashes')) {
	fs.mkdirSync( folder + '/splashes');
}


// loop around icons
loop( icons , function(icon,index,list,done){

	resize( folder + '/icon.png', folder + '/icons/', icon , done )

} , function(){

	// loop around splash screens
	loop( splashes , function(splash,index,list,done){

		crop( folder + '/splash.png', folder + '/splashes/', splash , done )

	} , function(){

		showMeteorConfig()

	})

} )
