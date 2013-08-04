jQuery( document ).ready( function( $ ) {
	sce = $.simplecommentediting = $.fn.simplecommentediting = function() {
		var $this = this;
		return this.each( function() {
			var ajax_url = $( this ).find( 'a:first' ).attr( 'href' );
			var ajax_params = wpAjax.unserialize( ajax_url );
			var element = this;

			//Set up event for when the edit button is clicked
			$( element ).on( 'click', 'a', function( e ) { 
				e.preventDefault();
				
				//Hide the edit button and show the textarea
				$( element ).fadeOut( 'fast', function() {
					$( element ).siblings( '.sce-textarea' ).find( 'button' ).prop( 'disabled', false );
					$( element ).siblings( '.sce-textarea' ).fadeIn( 'fast' );
				} );
			} );
			
			//Cancel button
			$( element ).siblings( '.sce-textarea' ).on( 'click', '.sce-comment-cancel', function( e ) {
				e.preventDefault();
				
				//Hide the textarea and show the edit button
				$( element ).siblings( '.sce-textarea' ).fadeOut( 'fast', function() {
					$( element ).fadeIn( 'fast' );
				} );
			} );
			
			//Save button
			$( element ).siblings( '.sce-textarea' ).on( 'click', '.sce-comment-save', function( e ) {
				e.preventDefault();
				
				$( element ).siblings( '.sce-textarea' ).find( 'button' ).prop( 'disabled', true );
				$( element ).siblings( '.sce-textarea' ).fadeOut( 'fast', function() {
					$( element ).siblings( '.sce-loading' ).fadeIn( 'fast' );
					
					//Save the comment
					var comment_to_save = encodeURIComponent( $( element ).siblings( '.sce-textarea' ).find( 'textarea' ).val() );
					$.post( ajax_url, { action: 'sce_save_comment', comment_content: comment_to_save, comment_id: ajax_params.cid, post_id: ajax_params.pid, nonce: ajax_params._wpnonce }, function( response ) {
						console.log( response );
						$( element ).siblings( '.sce-loading' ).fadeOut( 'fast', function() {
							$( element ).fadeIn( 'fast', function() {
								if ( !response.errors ) {
									$( '#sce-comment' + ajax_params.cid ).html( response.comment_text );
								} else {
									//Output error, kill edit interface
								}
							} );
						} );
						
						console.log( response );
					}, 'json' );
				} );
			} );
			
			//Use siblings to set up events for save/cancel button
			
			//Load timers
			/*
			1.  Use Ajax to get the amount of time left to edit the comment.
			2.  Display the result
			3.  Set Interval
			*/
			$.post( ajax_url, { action: 'sce_get_time_left', comment_id: ajax_params.cid, post_id: ajax_params.pid }, function( response ) {
				//Set initial timer text
				var minutes = parseInt( response.minutes );
				var seconds = parseInt( response.seconds );
				var timer_text = sce.get_timer_text( minutes, seconds );
				$( element ).find( '.sce-timer' ).html( timer_text );
				$( element ).show();
				
				//Set interval
				sce.timers[ response.comment_id ] = {
					minutes: minutes,
					seconds: seconds,
					timer: setInterval( function() {
						timer_seconds = sce.timers[ response.comment_id ].seconds - 1;
						timer_minutes = sce.timers[ response.comment_id ].minutes;
						if ( timer_minutes <=0 && timer_seconds <= 0) { 
							clearInterval( sce.timers[ response.comment_id ].timer );
							
							//Remove event handlers
							$( element ).siblings( '.sce-textarea' ).off();	
							$( element ).off();
								
							//Remove elements
							$( element ).parent().fadeOut( 'slow' );
						} else {
							if ( timer_seconds < 0 ) { 
								timer_minutes -= 1; timer_seconds = 59;
							} 
							$( element ).find( '.sce-timer' ).html(  sce.get_timer_text( timer_minutes, timer_seconds ) );
							sce.timers[ response.comment_id ].seconds = timer_seconds;
							sce.timers[ response.comment_id ].minutes = timer_minutes;
						}
					}, 1000 )
				};
				
				
			}, 'json' );
		} );
	};
	sce.get_timer_text = function( minutes, seconds ) {
		if (seconds < 0) { minutes -= 1; seconds = 59; }
		//Create timer text
		var text = '&nbsp;&ndash;&nbsp;';
		if (minutes >= 1) {
		if (minutes >= 2) { text += minutes + " " + simple_comment_editing.minutes; } else { text += minutes + " " + simple_comment_editing.minute; }
		if (seconds > 0) { text += " " + simple_comment_editing.and + " "; }
		}
		if (seconds > 0) {
			if (seconds >= 2) { text += seconds + " " + simple_comment_editing.seconds; } else { text += seconds + " " + simple_comment_editing.second; }
		
		}
		return text;
	};
	sce.timers = new Array();
	$( '.sce-edit-button' ).simplecommentediting();
} );