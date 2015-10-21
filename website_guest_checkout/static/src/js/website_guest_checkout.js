$(document).ready(function(){	


		
		



		

        $('#pk_checkout').on('click',function(event){

    		console.log($(this).attr('href'));
    		var uid =$('#pk_checkout').data('uid');       
       		 var p_uid = $('#pk_checkout').data('p_uid');

       		

           console.log("-----------------",uid,p_uid)
        if (uid==p_uid){
        	 custom_popover($('#pk_checkout'),true);
        	openerp.jsonRpc('/checkout/allowsignup/', 'call',{})
	                      .then(function (response) {
	                      	console.log(response);
	                      	if(response=='False')
	                      		{console.log('hide');
	                      		$('#signup_tab').hide();
	                      		$('#login_tab').css({"float":'none'});
	                      		}
	                      	else{
	                      		console.log('show');
	                      		$('#signup_tab').show();
	                      	}
		                      		
	                      });

        	 custom_popover($('#pk_checkout'),true);
        	$('#pk_checkout').popover('show');

        	// $('.wk_pop').parent().parent().parent().css('top','30%');
        	console.log("-----------------",uid,p_uid)
        		 // custom_popover($('#pk_checkout'),true);
        		 event.preventDefault();
        	 // return false;
        

        }
        else
        	$(location).attr('href', '/shop/checkout');
     


        });




function custom_popover(element_id,status){   
        
            element_id
                .popover({
            	trigger:'click',
            placement : 'right', 
             animation:true,          
            html:true,
            content : '        
        
        
        <div class="panel-body text-center wk_pop">
        <div class="container">
        <button  id="popover_close" class="close  btn-default" aria-label="Close" style="float:right" >X</button>
  <h5 class=" text-danger check_login_error" style="font-family: Opensans Sans-serif;
     font-weight: 600;
    color: #777777;
    font-size: 15px;">For Futher Processing.</h5>
          
  <ul class="nav nav-tabs" style="">
    <li id="login_tab" ><a data-toggle="tab" href="#check_login" >Login</a></li>
    <li id="signup_tab"><a data-toggle="tab" href="#check_signup" >Sign UP</a></li>
    
  </ul>

  <div class="tab-content">
    <div id="check_login" class="tab-pane fade in active">
     <form class="" role="form">
            <div class="form-group demo_checkout_login_class">
              <label class="sr-only" for="wk_signin_email">Email address</label>
              <input class="form-control" id="wk_signin_email" placeholder="Enter email" type="email">
            </div>
            <div class="form-group demo_checkout_login_class">
              <label class="sr-only" for="wk_signin_psw">Password</label>
              <input class="form-control" id="wk_signin_psw" placeholder="Password" type="password">
            </div>
           
            <button id="submit_sign" type="button" class="btn btn-info" title="">Sign in</button> 
           
          </form>
    </div>
    <div id="check_signup" class="tab-pane fade">
     <form class="" role="form">
    		 <div class="form-group demo_checkout_sign_up_class">
              <label class="sr-only" for="wk_signup_un">User Name</label>
              <input class="form-control" id="wk_signup_un" placeholder="User" type="text">
            </div>
            <div class="form-group demo_checkout_sign_up_class">
              <label class="sr-only" for="wk_signup_email">Email address</label>
              <input class="form-control" id="wk_signup_email" placeholder="Enter email" type="text">
            </div>
            <div class="form-group demo_checkout_sign_up_class">
              <label class="sr-only" for="wk_signup_psw">Password</label>
              <input class="form-control" id="wk_signup_psw" placeholder="Password" type="password">
            </div>
            <div class="form-group demo_checkout_sign_up_class">
              <label class="sr-only" for="wk_signup_cpsw">confirm Password</label>
              <input class="form-control" id="wk_signup_cpsw" placeholder="Confirm Password" type="password">
            </div>
           
            <button id="submit_signup" type="button" class="btn btn-info" title="">Sign up</button> 
      
          </form>
    </div>
    
  </div>
</div>

       ',


       }).on("show.bs.popover", function () { $(this).data("bs.popover").tip().css("width", "42%"); });

			
		

          }


        
  

$(document).on('click', '#popover_close', function () {

			$('#pk_checkout').popover('destroy');

			
   
  });


	function custom_msg(element_id,status,msg){
		if (status==true)
			console.log(msg,"------------Wrong login/password")
			{element_id.empty().append("<div class='alert alert-danger text-center' id='Wk_err'>"+msg+"
																<button type='button' class='close' data-dismiss='alert' aria-label='Close'>
																 <span class='res glyphicon glyphicon-remove ' aria-hidden='true'></span>
																 
																</button>
			
														</div>");
		}

		if (status==false)
			element_id.empty();
		
		return true;
	}	




	function custom_mark(element_id,status){
						if (status==true)
						element_id
						.parent()
							.addClass('has-error has-feedback');           			
		             
		           		


		           		}







$(document).on('click', '#submit_sign', function (){



	var db=$('#wk_database');
	var email=$('#wk_signin_email');

	var psw=$('#wk_signin_psw');
	var input = {login:email.val(), password:psw.val(), db:db.val()};
	console.log("----------",db,email,psw);
	
			openerp.jsonRpc('/checkout/login/', 'call',input)
	                      .then(function (response) {
	                      	console.log(response);
		                      		if (response['uid']!=false){	  
		                      		    	$(location).attr('href', '/shop/checkout');                		
		                      			
		                      		}
		                      		else{
		                      			console.log("wk_login_error");
		                      			custom_mark($('.demo_checkout_login_class'),true);   
		                      			$('.check_login_error').empty().append("wrong Login or password");
		                   	
		            				}
	                      });

			
	
   
  });

$(document).on('click', '#submit_signup', function (){

	var name=$('#wk_signup_un');	
	var login=$('#wk_signup_email');
	var password=$('#wk_signup_psw');
	var confirm_password=$('#wk_signup_cpsw');
	var input = {'login':login.val(), 'password':password.val(),confirm_password:confirm_password.val(), 'db':'test24',name:name.val(),redirect:'/shop'};
	console.log("-----sign up-----",input);	
	
			openerp.jsonRpc('/checkout/signup/', 'call',input)
	                      .then(function (res) {
	                      	console.log("------signup-----",res);                  
	                      	
	                          	
	                                       
	                      if (typeof (res['uid']) != "undefined")   								
	                      {
   								$(location).attr('href', '/shop/checkout'); 
	                      }  									
							else{


								$('.check_login_error').empty().append("Some Fields are not valid!");
									var a=jQuery("#check_signup input:text[value=''] ,#check_signup input:password[value=''] ");
							         a.each(function (index)
							         {
							           	$(this).parent()
														.addClass('has-error has-feedback')
									            			.append("<span class='glyphicon glyphicon-remove form-control-feedback'></span>");
							            
							         });

									
							
						         }
								
								
	                      	
	     
	                   }).fail(function (a,b,c,d,e) {	                   
	                  
	                            console.log("----------signufail-----",a,"-----",b,"-----",c,"-----",d,"-----",e);
	                           });	
	          


							
			});
	












  


                 
              
             
 		







});




